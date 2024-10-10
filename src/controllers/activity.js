import ActivityLog from '../models/activity.js';
import APIFeatures from '../utils/APIFeatures.js';

export const getActivityLogs = async (req, res, next) => {
  try {
    const { _id, role } = req.user;

    const filter = {
      ...(role === 'admin' ? { $or: [{ type: 'system' }, { userId: _id }] } : { userId: _id }),
    };

    const query = new APIFeatures(ActivityLog.find(filter), req.query).filter().sort().limitFields().paginate();

    const activities = await query.query;

    res.status(200).json({
      status: 'success',
      data: {
        activities,
      },
    });
  } catch (error) {
    next(error);
  }
};
