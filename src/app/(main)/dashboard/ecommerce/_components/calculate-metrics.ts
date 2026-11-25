export interface DashboardMetrics {
  totalSales: {
    value: string;
    trend: string;
    trendLabel: string;
    isPositive: boolean;
  };
  totalOrders: {
    value: string;
    trend: string;
    trendLabel: string;
    isPositive: boolean;
  };
  customerGrowth: {
    value: string;
    trend: string;
    trendLabel: string;
    isPositive: boolean;
  };
  averageOrder: {
    value: string;
    trend: string;
    trendLabel: string;
    isPositive: boolean;
  };
  returnRequests: {
    value: string;
    trend: string;
    trendLabel: string;
    isPositive: boolean;
  };
  stockAccuracy: {
    value: string;
    trend: string;
    trendLabel: string;
    isPositive: boolean;
  };
}

export function calculateMetricsFromOrders(orders: Array<{ total: string; payment: string; fulfillment: string; customer: string }>): DashboardMetrics {
  if (!orders || orders.length === 0) {
    return {
      totalSales: { value: "$0.00", trend: "+0.0%", trendLabel: "vs last week", isPositive: true },
      totalOrders: { value: "0", trend: "+0.0%", trendLabel: "vs last week", isPositive: true },
      customerGrowth: { value: "0", trend: "+0.0%", trendLabel: "vs last month", isPositive: true },
      averageOrder: { value: "$0", trend: "$0.00", trendLabel: "vs last week", isPositive: true },
      returnRequests: { value: "0", trend: "+0.0%", trendLabel: "vs last month", isPositive: false },
      stockAccuracy: { value: "98%", trend: "+1.2 pts", trendLabel: "vs last audit", isPositive: true },
    };
  }

  let totalSalesNum = 0;
  let returnCount = 0;
  const customers = new Set<string>();

  for (const o of orders) {
    if (o.customer) customers.add(o.customer);
    const amount = Number.parseFloat(o.total?.replace(/[^0-9.-]+/g, "") || "0");
    totalSalesNum += amount;
    if (o.fulfillment === "Returned" || o.payment === "Refunded") {
      returnCount++;
    }
  }

  const avgOrderNum = Math.round(totalSalesNum / orders.length);

  return {
    totalSales: {
      value: `$${totalSalesNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      trend: "+15.8%",
      trendLabel: "vs last week",
      isPositive: true,
    },
    totalOrders: {
      value: orders.length.toString(),
      trend: "+8.3%",
      trendLabel: "vs last week",
      isPositive: true,
    },
    customerGrowth: {
      value: customers.size.toString(),
      trend: "+12.5%",
      trendLabel: "vs last month",
      isPositive: true,
    },
    averageOrder: {
      value: `$${avgOrderNum.toLocaleString("en-US")}`,
      trend: "+$12.50",
      trendLabel: "vs last week",
      isPositive: true,
    },
    returnRequests: {
      value: returnCount.toString(),
      trend: "-1.2%",
      trendLabel: "vs last month",
      isPositive: true,
    },
    stockAccuracy: {
      value: "97%",
      trend: "+2.4 pts",
      trendLabel: "vs last audit",
      isPositive: true,
    },
  };
}
