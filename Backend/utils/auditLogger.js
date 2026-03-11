const AuditLog = require("../models/AuditLog");

const createAuditLog = async ({
  userId,
  userRole,
  action,
  entity,
  entityId = null,
  details = {},
  req = null,
}) => {
  try {
    const auditLog = new AuditLog({
      userId: userId || "system",
      userRole: userRole || "system",
      action,
      entity,
      entityId,
      details,
      ipAddress: req ? req.ip || req.connection?.remoteAddress : null,
      userAgent: req ? req.get("user-agent") : null,
    });

    await auditLog.save();
    return auditLog;
  } catch (error) {
    console.error("Error creating audit log:", error);
  }
};

const getAuditLogs = async (filters = {}, page = 1, limit = 50) => {
  try {
    const query = {};

    if (filters.userId) query.userId = filters.userId;
    if (filters.action) query.action = filters.action;
    if (filters.entity) query.entity = filters.entity;
    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
      if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    throw error;
  }
};

module.exports = {
  createAuditLog,
  getAuditLogs,
};
