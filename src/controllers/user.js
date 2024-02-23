import User from '../models/user.js';
import APIFeatures from '../utils/APIFeatures.js';

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
