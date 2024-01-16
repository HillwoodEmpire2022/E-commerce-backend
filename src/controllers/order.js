import Order from '../models/order.js';

export const getOrders = async (req, res, next) => {
  try {
    // Determine the user role
    const { role, _id } = req.user;

    // Create Query
    const queryObj = {};
    if (role === 'customer') queryObj.customer = _id;

    // Query Orders
    // For Customer, query orders that belong him
    const orders = await Order.find(queryObj);

    // For seller, query orders that belong to him

    // For admin
    // Query all orders

    res.status(200).json({
      status: 'success',
      count: orders.length,
      data: {
        orders,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      message: 'internal server error! Please try again.',
    });
  }
};
