import { getDB } from '../database/init.js';

export async function logAudit(userId, action, entityType, entityId, changes = null, ipAddress = null) {
  try {
    const db = await getDB();
    
    await db.run(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, changes, ip_address, created_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [userId, action, entityType, entityId, JSON.stringify(changes), ipAddress]
    );
  } catch (error) {
    console.error('Audit logging error:', error);
  }
}

export function auditLog(action, entity) {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logAudit(
          req.user?.id,
          action,
          entity,
          req.body?.id || req.params?.id,
          req.body,
          req.ip
        );
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
}
