import { readPool, writePool } from '../db';
import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

export const getAllOrders = async (shopId?: string, ownerId?: string, userId?: string) => {
  let query = `
    SELECT o.*, u.name as user_name, s.name as shop_name 
    FROM orders o 
    LEFT JOIN users u ON o.user_id = u.id 
    LEFT JOIN shops s ON o.shop_id = s.id
  `;
  const params: any[] = [];
  const whereClauses: string[] = [];

  if (shopId) {
    whereClauses.push('o.shop_id = ?');
    params.push(shopId);
  }

  if (ownerId) {
    whereClauses.push('s.owner_id = ?');
    params.push(ownerId);
  }

  if (userId) {
    whereClauses.push(`(
      o.shop_id IN (SELECT shop_id FROM user_shops WHERE user_id = ?) 
      OR o.shop_id = (SELECT shop_id FROM users WHERE id = ?)
    )`);
    params.push(userId, userId);
  }

  if (whereClauses.length > 0) {
    query += ' WHERE ' + whereClauses.join(' AND ');
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
          
          if ((status === 'Cancelled' || status === 'Voided') && oldStatus !== 'Cancelled' && oldStatus !== 'Voided' && oldStatus === 'Completed') {
            for (const item of parsedItems) {
              const productId = item.id || item.productId;
              if (productId) {
                await connection.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, productId]);
                // Log stock history
                await connection.query(
                  'INSERT INTO stock_history (product_id, shop_id, change_amount, type, reason) VALUES (?, ?, ?, ?, ?)',
                  [productId, shop_id, item.quantity, status === 'Voided' ? 'Void' : 'Adjustment', `Order ${status}: ${id}`]
                );
              }
            }
          }
        } else {
          await connection.query(
            `INSERT INTO orders (id, date, total, status, currency, paymentMethod, itemsJson, amountReceived, changeAmount, remark, user_id, shop_id, syncedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
            [id, new Date(date), total, status, currency, paymentMethod, items, amountReceived || 0, changeAmount || 0, remark || null, user_id, shop_id, new Date(syncedAt)]
          );
          
          if (status === 'Completed') {
            for (const item of parsedItems) {
              const productId = item.id || item.productId;
              if (productId) {
                await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, productId]);
                // Log stock history
                await connection.query(
                  'INSERT INTO stock_history (product_id, shop_id, change_amount, type, reason) VALUES (?, ?, ?, ?, ?)',
                  [productId, shop_id, -item.quantity, 'Sale', `Sale Order: ${id}`]
                );
              }
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
};

export const voidOrder = async (orderId: string, reason: string, voidedBy: string) => {
  const connection = await writePool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Get order details
    const [orders] = await connection.query<RowDataPacket[]>('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (orders.length === 0) throw new Error('Order not found');
    const order = orders[0];

    if (order.status === 'Voided') throw new Error('Order is already voided');

    // 2. Update order status
    await connection.query(
      'UPDATE orders SET status = "Voided", void_reason = ?, voided_at = NOW(), voided_by = ? WHERE id = ?',
      [reason, voidedBy, orderId]
    );

    // 3. Restore stock and log history
    const items = typeof order.itemsJson === 'string' ? JSON.parse(order.itemsJson) : (order.itemsJson || []);
    for (const item of items) {
      const productId = item.id || item.productId;
      if (productId) {
        await connection.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, productId]);
        await connection.query(
          'INSERT INTO stock_history (product_id, shop_id, change_amount, type, reason, created_by) VALUES (?, ?, ?, ?, ?, ?)',
          [productId, order.shop_id, item.quantity, 'Void', `Manual Void: ${orderId} - ${reason}`, voidedBy]
        );
      }
    }

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
