import Order from '../models/order.js';
import orderSchemaJoi from '../validations/orderValidation.js';

export const getOrders = async (req, res, next) => {
  try {
    // Determine the user role
    const { role, _id } = req.user;

    // Create Query Object

    const queryObj = {};
    let orders;

    // For Customers
    if (role === 'customer') {
      queryObj.customer = _id;
      orders = await Order.find(queryObj);
    }

    // For Seller
    if (role === 'seller') {
      orders = await getOrdersBySeller(_id);
    }

    // For admin
    // Query all orders
    if (role === 'admin') {
      orders = await Order.find();
    }

    res.status(200).json({
      status: 'success',
      count: orders.length,
      data: {
        orders,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'internal server error! Please try again.',
    });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { error } = orderSchemaJoi.validate(req.body, {
      errors: { label: 'key', wrap: { label: false } },
    });
    if (error) {
      return res.status(400).json({ status: 'fail', message: error.message });
    }

    if (req.body?.items)
      return res
        .status(400)
        .json({ status: 'fail', message: 'you cannot update order items' });

    const order = await Order.findByIdAndUpdate(req.params.id, req.body);

    if (!order)
      return res.status(404).json({
        status: 'fail',
        message: 'order not found.',
      });

    res.status(200).json({
      status: 'success',
      message: 'order updated successfully!',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'internal server error',
    });
  }
};

async function getOrdersBySeller(sellerId) {
  try {
    const stats = await Order.aggregate([
      {
        $unwind: '$items',
      },

      {
        $lookup: {
          from: 'products',
          foreignField: '_id',
          localField: 'items.product',
          as: 'itemDetails',
        },
      },

      {
        $project: {
          amount: 1,
          phoneNumber: 1,
          createdAt: 1,
          shippingAddress: 1,
          transId: 1,
          status: 1,
          customer: 1,
          quantity: '$items.quantity',

          // ... other fields
          itemDetails: {
            $arrayElemAt: [
              {
                $map: {
                  input: '$itemDetails',
                  as: 'detail',
                  in: {
                    id: '$$detail._id',
                    name: '$$detail.name',
                    description: '$$detail.description',
                    price: '$$detail.price',
                    seller: '$$detail.seller',
                    thumbnail: '$$detail.productImages.productThumbnail.url',
                  },
                },
              },
              0, // Index of the first (and only) element
            ],
          },
        },
      },

      { $match: { 'itemDetails.seller': sellerId } },

      {
        $group: {
          _id: '$_id',
          items: {
            $push: {
              itemDetails: '$itemDetails',
              quantity: '$quantity',
            },
          },
          amount: { $first: '$amount' },
          phoneNumber: { $first: '$phoneNumber' },
          OrderDate: { $first: '$createdAt' },
          shippingAddress: { $first: '$shippingAddress' },
          transactionId: { $first: '$transId' },
          status: { $first: '$status' },
          customer: { $first: '$customer' },
        },
      },
    ]);

    return stats;
  } catch (error) {
    return error;
  }
}
