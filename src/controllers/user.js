import User from '../models/user.js';
import APIFeatures from '../utils/APIFeatures.js';
import { mongoIdValidator } from '../validations/mongoidValidator.js';
import { updateUserSchema } from '../validations/userUpdateValidation.js';

export const getUsers = async (req, res) => {
  try {
    // EXECUTE QUERY
    const features = new APIFeatures(User.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const users = await features.query;

    res.status(200).json({
      status: 'success',
      count: users.length,
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
    console.log(userId);
    const user = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
    });

    if (!user) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'User not found' });
    }

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
    const features = new APIFeatures(
      User.findById(req.params.id).populate('profile'),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const user = await features.query;

    if (!user)
      return res
        .status(404)
        .json({ status: 'fail', message: 'User not found.' });

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
