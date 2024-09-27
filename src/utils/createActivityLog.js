import UAParser from 'ua-parser-js';
import ActivityLog from '../models/activity.js';

export const createdActivityLog = async (activity) => {
  const newActivity = await ActivityLog.create(activity);

  return newActivity;
};

export const extractUserAgentdata = (req) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const ipAddress = ip?.split('::ffff:')[1];

  const userAgent = req.headers['user-agent'];
  const parsedUserAgent = new UAParser(userAgent);

  const { browser, os } = parsedUserAgent.getResult();

  return { ipAddress, browser, os };
};
