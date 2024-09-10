import UAParser from 'ua-parser-js';
import UserProfile from '../models/userProfile.js';
import AppError from '../utils/AppError.js';

import removeEmptySpaces from '../utils/removeEmptySpaces.js';
import { createdActivityLog } from '../utils/createActivityLog.js';

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
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ipAddress = ip?.split('::ffff:')[1];
    const userAgent = req.headers['user-agent'];
    const parsedUserAgent = new UAParser(userAgent);

    const { browser, os } = parsedUserAgent.getResult();

    try {
      await createdActivityLog({
        userId: loggedInUser.id,
        activity: {
          type: 'user',
          action: 'profile_update',
        },
        details: 'Profile updated',
        status: 'success',
        ipAddress,
        userAgent: {
          browser: `${browser.name} ${browser.version}`,
          os: ` ${os.name} ${os.version}`,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(200).json({
        status: 'success',
        data: {
          profile: userProfile,
        },
      });
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
