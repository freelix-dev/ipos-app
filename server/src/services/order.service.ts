import { readPool, writePool } from '../db';
import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

export const getAllOrders = async (shopId?: string) => {
  let query = `
    SELECT o.*, u.name as user_name, s.name as shop_name 
    FROM orders o 
    LEFT JOIN users u ON o.user_id = u.id 
    LEFT JOIN shops s ON o.shop_id = s.id
  `;
  const params: any[] = [];

  if (shopId) {
    query += ' WHERE o.shop_id = ?';
    params.push(shopId);
  }

  query += ' ORDER BY o.date DESC LIMIT 100';

  const [orders] = await readPool.query<RowDataPacket[]>(query, params);
  return orders;
};

export const syncOrders = async (ordersToProcess: any[]) => {
  const connection = await writePool.getConnection();
  try {
    await connection.beginTransaction();
    console.log(`[order.service] Starting sync for ${ordersToProcess.length} orders`);
    
    for (const incomingOrder of ordersToProcess) {
      try {
        let items = typeof incomingOrder.itemsJson === 'string' ? incomingOrder.itemsJson : JSON.stringify(incomingOrder.itemsJson || []);
        const parsedItems = typeof incomingOrder.itemsJson === 'string' ? JSON.parse(incomingOrder.itemsJson) : (incomingOrder.itemsJson || []);
        const { date, total, status, currency, paymentMethod, amountReceived, changeAmount, remark } = incomingOrder;
        const id: string = (incomingOrder.id && incomingOrder.id.length >= 32) ? incomingOrder.id : uuidv4();
        const syncedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        let user_id = incomingOrder.user_id || incomingOrder.userId || null;
        let shop_id = incomingOrder.shop_id || incomingOrder.shopId || null;
        
        // Final foreign key safety check
        if (user_id) {
          const [userRows] = await connection.query<RowDataPacket[]>('SELECT id, shop_id FROM users WHERE id = ?', [user_id]);
          if (userRows.length === 0) {
            console.warn(`[order.service] Warning: User ${user_id} not found. Setting user_id to null for order ${id}`);
            user_id = null;
          } else if (!shop_id) {
            // Fallback to user's shop_id if not provided
            shop_id = userRows[0].shop_id;
          }
        }

        console.log(`[order.service] Processing order ${id} (Status: ${status}, Shop: ${shop_id}, User: ${user_id})`);

        const [existing] = await connection.query<RowDataPacket[]>('SELECT status FROM orders WHERE id = ?', [id]);
        
        if (existing.length > 0) {
          const oldStatus = existing[0].status;
          await connection.query(
            `UPDATE orders SET status = ?, remark = ?, user_id = ?, shop_id = ?, syncedAt = ? WHERE id = ?`, 
            [status, remark || null, user_id, shop_id, syncedAt, id]
          );
          
          if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
            for (const item of parsedItems) {
              await connection.query('UPDATE products SET stock = stock + ? WHERE id = ? OR name = ?', [item.quantity, item.id, item.name]);
            }
          }
        } else {
          await connection.query(
            `INSERT INTO orders (id, date, total, status, currency, paymentMethod, itemsJson, amountReceived, changeAmount, remark, user_id, shop_id, syncedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
            [id, new Date(date), total, status, currency, paymentMethod, items, amountReceived || 0, changeAmount || 0, remark || null, user_id, shop_id, new Date(syncedAt)]
          );
          
          if (status === 'Completed') {
            for (const item of parsedItems) {
              await connection.query('UPDATE products SET stock = stock - ? WHERE id = ? OR name = ?', [item.quantity, item.id, item.name]);
            }
          }
        }
      } catch (orderError) {
        console.error(`[order.service] Error processing order ${incomingOrder.id}:`, orderError);
        throw orderError; // Rethrow to trigger rollback
      }
    }
    await connection.commit();
    console.log('[order.service] Transaction committed successfully');
    
    // Fix: Using double array for IN clause
    const ids = ordersToProcess.map(o => o.id).filter(id => id);
    if (ids.length > 0) {
      const [savedOrders] = await connection.query<RowDataPacket[]>('SELECT id FROM orders WHERE id IN (?)', [ids]);
      return { count: ordersToProcess.length, orders: savedOrders };
    }
    return { count: ordersToProcess.length, orders: [] };
  } catch (error) {
    console.error('[order.service] General sync error:', error);
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
