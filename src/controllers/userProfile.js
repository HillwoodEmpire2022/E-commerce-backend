import UserProfile from '../models/userProfile.js';
import AppError from '../utils/AppError.js';
import removeEmptySpaces from '../utils/removeEmptySpaces.js';

export const getProfiles = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = { ...(id && { user: id }) };
    const userProfile = await UserProfile.find(filter);

    if (!userProfile.length) {
      return next(new AppError('Profile not found.', 404));
    }

    const response = userProfile.length > 1 ? userProfile : userProfile[0];

    res.status(200).json({
      status: 'success',
      data: {
        profile: response,
      },
    });
  } catch (error) {
    next(error);
  }
};

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
    const { id, profileId } = req.params;
    const userProfile = await UserProfile.findOne({ user: id, _id: profileId });

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
