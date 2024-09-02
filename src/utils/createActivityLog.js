import ActivityLog from '../models/activity.js';

export const createdActivityLog = async (activity) => {
  const newActivity = await ActivityLog.create(activity);

  return newActivity;
};
