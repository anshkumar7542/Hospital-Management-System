const { activityLogs } = require('../repositories/domain.repositories');

const logActivity = async (req, action, entityType, entityId, description) => {
  await activityLogs.create({
    user_id: req.user?.id || null,
    action,
    entity_type: entityType,
    entity_id: entityId || null,
    description,
    ip_address: req.ip,
    user_agent: req.headers['user-agent']
  });
};

module.exports = { logActivity };
