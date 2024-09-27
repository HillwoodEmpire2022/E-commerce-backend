import User from '../models/user.js';
import { createdActivityLog, extractUserAgentdata } from '../utils/createActivityLog.js';

export const restrictTo = (...roles) => {
  return async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      // Log the unauthorized access attempt
      const { ipAddress, browser, os } = extractUserAgentdata(req);

      // Find admin user
      const adminUsers = await User.find({ role: 'admin' }).select('_id');

      adminUsers.forEach(async (admin) => {
        const activity = {
          userId: admin?._id,
          activity: {
            type: 'security',
            action: 'unauthorized_access_attempt',
          },
          details: `User tried to access a route: ${req.originalUrl} without permission`,
          status: 'failure',
          ipAddress,
          userAgent: {
            browser: `${browser.name} ${browser.version}`,
            os: ` ${os.name} ${os.version}`,
          },
        };

        await createdActivityLog(activity);
      });

      return res.status(403).json({
        status: 'fail',
        message: 'Access denied! You are not allowed to perform this operation.',
      });
    }
    next();
  };
};
