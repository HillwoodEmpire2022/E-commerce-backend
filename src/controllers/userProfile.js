import UAParser from 'ua-parser-js';
import UserProfile from '../models/userProfile.js';
import AppError from '../utils/AppError.js';

import removeEmptySpaces from '../utils/removeEmptySpaces.js';
import { createdActivityLog, extractUserAgentdata } from '../utils/createActivityLog.js';

async function createActivityLogs(user_id, req, doer, type, action, details, status) {
  const { ipAddress, browser, os } = extractUserAgentdata(req);

  const activity = {
    userId: doer?._id,
    activity: {
      type,
      action,
    },

    resource: {
      name: 'user-profiles',
      id: user_id,
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

export const updateProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const loggedInUser = req.user;

    if (loggedInUser.id !== id) {
      return next(new AppError('You are not allowed to perform this action.', 403));
    }

    let userProfile = await UserProfile.findOneAndUpdate(
      {
        user: id,
      },
      {
        ...req.body,
        address: {
          ...(req.body.address && { district: removeEmptySpaces(req.body.address.district) }),
          ...(req.body.address && { sector: removeEmptySpaces(req.body.address.sector) }),
          ...(req.body.address && { street: removeEmptySpaces(req.body.address.street) }),
        },
      },
      {
        new: true,
      }
    );

    if (!userProfile) {
      userProfile = await UserProfile.create({
        user: id,
        ...req.body,
        address: {
          ...(req.body.address && { district: removeEmptySpaces(req.body.address.district) }),
          ...(req.body.address && { sector: removeEmptySpaces(req.body.address.sector) }),
          ...(req.body.address && { street: removeEmptySpaces(req.body.address.street) }),
        },
      });
    }

    // Create Activity Log
    //  Activity Log
    await createActivityLogs(
      userProfile._id,
      req,
      req.user._id,
      'user',
      'profile_update',
      `Profile updated`,
      'success'
    );

    res.status(200).json({
      status: 'success',
      data: {
        profile: userProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const userProfile = await UserProfile.findOne({ user: id });

    if (!userProfile) {
      return next(new AppError('Profile not found.', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        profile: userProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};
