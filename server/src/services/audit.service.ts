import { readPool, writePool } from '../db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { randomUUID } from 'crypto';

export const createAuditLog = async (logData: {
  user_id?: string;
  shop_id?: string;
  action: string;
  target_type?: string;
  target_id?: string;
  details?: string;
  ip_address?: string;
}) => {
  const { user_id, shop_id, action, target_type, target_id, details, ip_address } = logData;
  const id = randomUUID();
  
  try {
    await writePool.query<ResultSetHeader>(
      'INSERT INTO audit_logs (id, user_id, shop_id, action, target_type, target_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, user_id || null, shop_id || null, action, target_type || null, target_id || null, details || null, ip_address || null]
    );
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

export const getAuditLogs = async (filters: {
  shopId?: string;
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}) => {
  let query = 'SELECT al.*, u.name as user_name, s.name as shop_name FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id LEFT JOIN shops s ON al.shop_id = s.id';
  const params: any[] = [];
  const whereClauses: string[] = [];

  if (filters.shopId) {
    whereClauses.push('al.shop_id = ?');
    params.push(filters.shopId);
  }
  if (filters.userId) {
    whereClauses.push('al.user_id = ?');
    params.push(filters.userId);
  }
  if (filters.action) {
    whereClauses.push('al.action LIKE ?');
    params.push(`%${filters.action}%`);
  }
  if (filters.startDate) {
    whereClauses.push('al.created_at >= ?');
    params.push(filters.startDate);
  }
  if (filters.endDate) {
    whereClauses.push('al.created_at <= ?');
    params.push(filters.endDate);
  }

  if (whereClauses.length > 0) {
    query += ' WHERE ' + whereClauses.join(' AND ');
  }

  query += ' ORDER BY al.created_at DESC LIMIT 500';

  const [logs] = await readPool.query<RowDataPacket[]>(query, params);
  return logs;
};
