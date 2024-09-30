import User from '../models/user.js';
import APIFeatures from '../utils/APIFeatures.js';
import { createdActivityLog, extractUserAgentdata } from '../utils/createActivityLog.js';
import { mongoIdValidator } from '../validations/mongoidValidator.js';
import { updateUserSchema } from '../validations/userUpdateValidation.js';

export const getUsers = async (req, res) => {
  try {
    // EXECUTE QUERY
    const features = new APIFeatures(User.find(), req.query).filter().sort().limitFields().paginate();

    const users = await features.query;

    const totalUsers = await User.countDocuments();

    res.status(200).json({
      status: 'success',
      count: users.length,
      totalUsers,
      data: {
        users,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'internal server error! Please try again.',
    });
  }
};

export const updateUserRole = async (req, res) => {
  const userId = req.params.id;
  try {
    const { error } = updateUserSchema.validate(req.body, {
      errors: { label: 'key', wrap: { label: false } },
      allowUnknown: true,
    });

    if (error) {
      return res.status(400).json({ status: 'fail', message: error.message });
    }

    // Fetch the user by ID
    const user = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
    });

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    // Create activity log
    const { ipAddress, browser, os } = extractUserAgentdata(req);

    const adminUsers = await User.find({ role: 'admin' }).select('_id');

    adminUsers.forEach(async (admin) => {
      const activity = {
        userId: admin?._id,
        activity: {
          type: 'user',
          action: 'user_role_updated',
        },
        details: `User role updated to "${req.body.role}" for user with ID: ${userId}`,
        status: 'success',
        ipAddress,
        userAgent: {
          browser: `${browser.name} ${browser.version}`,
          os: ` ${os.name} ${os.version}`,
        },
      };

      await createdActivityLog(activity);
    });

    console.log(user);

    res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUser = async (req, res) => {
  try {
    // 1) Validate user data
    const { error } = mongoIdValidator.validate(req.params, {
      errors: { label: 'key', wrap: { label: false } },
    });

    if (error) {
      return res.status(400).json({ status: 'fail', message: error.message });
    }

    // EXECUTE QUERY
    const features = new APIFeatures(User.findById(req.params.id).populate('profile'), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const user = await features.query;

    if (!user) return res.status(404).json({ status: 'fail', message: 'User not found.' });

    res.status(200).json({
      status: 'success',
      data: {
        user: user[0],
      },
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

export const searchUser = async (req, res, next) => {
  const { query } = req.query;

  try {
    const aggregationPipeline = [
      {
        $search: {
          index: 'users_fulltext_search',
          text: {
            query,
            path: {
              wildcard: '*',
            },
            fuzzy: {
              maxEdits: 2,
            },
          },
        },
      },

      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          role: 1,
        },
      },
    ];

    const users = await User.aggregate(aggregationPipeline);

    return res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};
