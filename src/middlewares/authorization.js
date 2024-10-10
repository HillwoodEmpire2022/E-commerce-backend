import { createdActivityLog, extractUserAgentdata } from '../utils/createActivityLog.js';

async function createActivityLogs(req, doer, type, action, details, status) {
  const { ipAddress, browser, os } = extractUserAgentdata(req);

  const activity = {
    userId: doer?._id,
    activity: {
      type,
      action,
    },

    details,
    status,

    ipAddress,
    userAgent: {
      browser: `${browser.name} ${browser.version}`,
      os: ` ${os.name} ${os.version}`,
    },
  };

  await createdActivityLog(activity);
}

export const restrictTo = (...roles) => {
  return async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      await createActivityLogs(
        req,
        req.user,
        'system',
        'unauthorized_access_attempt',
        `User tried to access a route: ${req.originalUrl} without permission`,
        'failure'
      );

      return res.status(403).json({
        status: 'fail',
        message: 'Access denied! You are not allowed to perform this operation.',
      });
    }
    next();
  };
};
