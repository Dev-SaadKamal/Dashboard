import { createClient } from "@/lib/supabase/server";
import { type OrderRow } from "./schema";

export async function getRecentOrders(): Promise<OrderRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("id, date, customer, payment, total, items, fulfillment")
      .order("date", { ascending: false });

    if (error || !data || data.length === 0) {
      if (error) {
        console.warn("Failed to fetch orders from Supabase, falling back to local data:", error.message);
      }
      const localData = (await import("./data.json")).default;
      return localData as OrderRow[];
    }

    return data as OrderRow[];
  } catch (err) {
    console.warn("Error querying orders from Supabase:", err);
    const localData = (await import("./data.json")).default;
    return localData as OrderRow[];
  }
}
