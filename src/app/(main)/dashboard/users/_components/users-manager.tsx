"use client";

import { useState, useTransition } from "react";
import { createUser } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, ShieldCheck, UserCheck } from "lucide-react";

interface UserItem {
  id: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
  lastSignInAt?: string | null;
}

export function UsersManager({ initialUsers }: { initialUsers: UserItem[] }) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCreateUser = (formData: FormData) => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await createUser(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success && result.user) {
        const newUser: UserItem = {
          id: result.user.id,
          email: result.user.email ?? "",
          fullName:
            (result.user.user_metadata?.full_name as string) ||
            result.user.email?.split("@")[0] ||
            "User",
          role:
            (result.user.app_metadata?.role ||
              result.user.user_metadata?.role ||
              "viewer").toLowerCase(),
          createdAt: result.user.created_at,
          lastSignInAt: null,
        };
        setUsers((prev) => [newUser, ...prev]);
        setSuccess(`User ${newUser.email} created successfully as ${newUser.role}!`);
        setShowAddForm(false);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="gap-2 cursor-pointer"
        >
          <Plus className="size-4" />
          {showAddForm ? "Cancel" : "Add New User"}
        </Button>
      </div>

      {showAddForm && (
        <Card className="border-primary/20 shadow-sm">
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
            <CardDescription>
              Assign role permissions: Admins can create users, Viewers can only view dashboards.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleCreateUser} className="space-y-4 max-w-xl">
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-md bg-emerald-500/15 p-3 text-sm text-emerald-600 font-medium">
                  {success}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" name="fullName" placeholder="Jane Doe" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="jane@example.com"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Min 6 characters"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  name="role"
                  defaultValue="viewer"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                >
                  <option value="viewer" className="bg-background text-foreground">
                    Viewer (Dashboard View Only)
                  </option>
                  <option value="admin" className="bg-background text-foreground">
                    Admin (Full Access & User Management)
                  </option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={isPending} className="cursor-pointer">
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isPending ? "Creating..." : "Save User"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {success && !showAddForm && (
        <div className="rounded-md bg-emerald-500/15 p-3 text-sm text-emerald-600 font-medium">
          {success}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Existing Users</CardTitle>
          <CardDescription>
            All registered accounts with active permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="font-medium">{u.fullName}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </TableCell>
                    <TableCell>
                      {u.role === "admin" ? (
                        <Badge variant="default" className="gap-1">
                          <ShieldCheck className="size-3" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <UserCheck className="size-3" />
                          Viewer
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-emerald-600 border-emerald-500/30">
                        Active
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
