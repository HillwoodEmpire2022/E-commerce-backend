import Order from '../models/order.js';
import APIFeatures from '../utils/APIFeatures.js';
import { mongoIdValidator } from '../validations/mongoidValidator.js';
import orderSchemaJoi from '../validations/orderValidation.js';

export const getOrders = async (req, res, next) => {
  try {
    // Determine the user role
    const { role, _id } = req.user;

    // Create Query Object
    let filter, orders;

    // For Seller
    if (role === 'seller') {
      orders = await getOrdersBySeller(_id, req.query);
    } else {
      if (role === 'customer') filter = { customer: _id };
      if (role === 'admin') filter = {};

      // EXECUTE QUERY
      const features = new APIFeatures(Order.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

      orders = await features.query;
    }

    res.status(200).json({
      status: 'success',
      count: orders.length,
      data: {
        orders,
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

export const getOrder = async (req, res) => {
  try {
    const filter = {
      _id: req.params.id,
    };

    let order;
    const { role, _id } = req.user;

    const { error } = mongoIdValidator.validate(req.params, {
      errors: { label: 'key', wrap: { label: false } },
    });

    if (error) {
      return res.status(400).json({ status: 'fail', message: error.message });
    }

    if (role === 'customer') filter.customer = _id;

    order = await Order.findOne(filter);

    if (!order)
      return res.status(404).json({
        status: 'fail',
        message: 'order not found.',
      });

    res.status(200).json({
      status: 'success',
      data: {
        order,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      message: 'internal server error',
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

async function getOrdersBySeller(sellerId, query = {}) {
  const filter = {
    ...(query.status && { status: query.status }),
  };

  const projection = query.fields
    ? query.fields.split(',').reduce((acc, field) => {
        return { ...acc, [field]: 1 };
      }, {})
    : {
        customer: 1,
        tx_ref: 1,
        transId: 1,
        items: 1,
        phoneNumber: 1,
        amount: 1,
        status: 1,
        shippingAddress: 1,
      };

  try {
    const stats = await Order.aggregate([
      {
        $match: filter,
      },

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

      {
        $project: {
          ...projection,
        },
      },
    ]);

    return stats;
  } catch (error) {
    return error;
  }
}
