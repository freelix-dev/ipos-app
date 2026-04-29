import { readPool } from '../db';
import { RowDataPacket } from 'mysql2';

export const getDashboardStats = async (shopId?: string) => {
  const params: any[] = [];
  let shopFilter = '';
  if (shopId) {
    shopFilter = 'AND shop_id = ?';
    params.push(shopId);
  }

  // 1. Sales Over Time (Last 30 Days)
  const salesQuery = `
    SELECT DATE(date) as day, currency, SUM(total) as revenue, COUNT(id) as orderCount
    FROM orders
    WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    AND status = 'Completed'
    ${shopFilter}
    GROUP BY DATE(date), currency
    ORDER BY day ASC
  `;

  // 2. Top Products (based on itemsJson)
  // This is tricky because items are in JSON. For a real app, we'd have an order_items table.
  // But for now, we'll try to get recent orders and manually aggregate or use a simpler metric.
  // Let's just get the last 500 completed orders and aggregate.
  const recentOrdersQuery = `
    SELECT itemsJson FROM orders 
    WHERE status = 'Completed' ${shopFilter} 
    ORDER BY date DESC LIMIT 500
  `;

  // 3. Payment Method Distribution
  const paymentQuery = `
    SELECT paymentMethod, SUM(total) as value, COUNT(id) as count
    FROM orders
    WHERE status = 'Completed' ${shopFilter}
    GROUP BY paymentMethod
  `;

  // 4. Summary Stats (Grouped by Currency)
  const summaryQuery = `
    SELECT 
      currency,
      SUM(CASE WHEN DATE(date) = CURDATE() THEN total ELSE 0 END) as todayRevenue,
      COUNT(CASE WHEN DATE(date) = CURDATE() THEN id ELSE NULL END) as todayOrders,
      SUM(total) as totalRevenue,
      COUNT(id) as totalOrders
    FROM orders
    WHERE status = 'Completed' ${shopFilter}
    GROUP BY currency
  `;

  // 5. Category Distribution
  const categoryQuery = `
    SELECT c.name, COUNT(p.id) as count
    FROM categories c
    LEFT JOIN products p ON c.id = p.category_id
    WHERE 1=1 ${shopId ? 'AND c.shop_id = ?' : ''}
    GROUP BY c.id, c.name
  `;

  // 6. Supplier Distribution
  const supplierQuery = `
    SELECT s.name, COUNT(p.id) as count
    FROM suppliers s
    LEFT JOIN products p ON s.id = p.supplier_id
    WHERE 1=1 ${shopId ? 'AND s.shop_id = ?' : ''}
    GROUP BY s.id, s.name
  `;

  const [salesData] = await readPool.query<RowDataPacket[]>(salesQuery, params);
  const [paymentData] = await readPool.query<RowDataPacket[]>(paymentQuery, params);
  const [summaryData] = await readPool.query<RowDataPacket[]>(summaryQuery, params);
  const [recentOrders] = await readPool.query<RowDataPacket[]>(recentOrdersQuery, params);
  const [categoryData] = await readPool.query<RowDataPacket[]>(categoryQuery, shopId ? [shopId] : []);
  const [supplierData] = await readPool.query<RowDataPacket[]>(supplierQuery, shopId ? [shopId] : []);

  // Manually aggregate top products from JSON
  const productMap: Record<string, { name: string, quantity: number, revenue: number }> = {};
  recentOrders.forEach(order => {
    try {
      const items = typeof order.itemsJson === 'string' ? JSON.parse(order.itemsJson) : order.itemsJson;
      if (Array.isArray(items)) {
        items.forEach((item: any) => {
          const key = item.id || item.name;
          if (!productMap[key]) productMap[key] = { name: item.name, quantity: 0, revenue: 0 };
          productMap[key].quantity += (item.quantity || 1);
          productMap[key].revenue += (item.price || 0) * (item.quantity || 1);
        });
      }
    } catch (e) { /* ignore */ }
  });

  const topProducts = Object.values(productMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return {
    salesOverTime: salesData,
    paymentDistribution: paymentData,
    summary: summaryData, // Array of summaries by currency
    topProducts,
    categoryDistribution: categoryData,
    supplierDistribution: supplierData
  };
};

export const getGlobalStats = async () => {
  // 1. Total Shops
  const [shopData] = await readPool.query<RowDataPacket[]>('SELECT COUNT(*) as total FROM shops');
  
  // 2. Global Order Volume (Last 30 Days)
  const [orderVolume] = await readPool.query<RowDataPacket[]>(`
    SELECT currency, SUM(total) as revenue, COUNT(id) as count 
    FROM orders 
    WHERE status = 'Completed' AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    GROUP BY currency
  `);

  // 3. Top Shops by Order Count
  const [topShops] = await readPool.query<RowDataPacket[]>(`
    SELECT s.name, COUNT(o.id) as orderCount, SUM(o.total) as totalRevenue, o.currency
    FROM shops s
    JOIN orders o ON s.id = o.shop_id
    WHERE o.status = 'Completed'
    GROUP BY s.id, s.name, o.currency
    ORDER BY orderCount DESC
    LIMIT 5
  `);

  return {
    totalShops: shopData[0].total,
    globalVolume: orderVolume,
    topShops
  };
};
