import mongoose from 'mongoose';
import Order from '../models/order.js';
import APIFeatures from '../utils/APIFeatures.js';
import { mongoIdValidator } from '../validations/mongoidValidator.js';
import orderJoiSchema from '../validations/orderValidation.js';

const fetchSellerOrders = async (sellerId, query) => {
  // Pagination
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  //  Filtering by status
  const filter = {
    ...(query.status && { status: query.status }),
  };

  // Selecting certain fields (projection)
  const projection = query.fields
    ? query.fields.split(',').reduce((acc, field) => {
        return { ...acc, [field]: 1 };
      }, {})
    : {
        customer: 1,
        tx_ref: 1,
        transId: 1,
        items: 1,
        amount: 1,
        status: 1,
        shippingAddress: 1,
      };

  try {
    const orders = await Order.aggregate([
      {
        $unwind: '$items',
      },

      {
        $match: filter,
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
          createdAt: 1,
          shippingAddress: 1,
          tx_ref: 1,
          status: 1,
          customer: 1,
          quantity: '$items.quantity',
          variation: 1,
          deliveryPreference: 1,
          sellerPaymentStatus: '$items.sellerPaymentStatus',
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
              0,
            ],
          },
        },
      },

      {
        $match: {
          'itemDetails.seller': new mongoose.Types.ObjectId(sellerId),
        },
      },

      {
        $group: {
          _id: '$_id',
          items: {
            $push: {
              itemDetails: '$itemDetails',
              quantity: '$quantity',
              sellerPaymentStatus: '$sellerPaymentStatus',
            },
          },
          amount: { $first: '$amount' },
          createdAt: { $first: '$createdAt' },
          shippingAddress: { $first: '$shippingAddress' },
          transactionId: { $first: '$transId' },
          status: { $first: '$status' },
          customer: { $first: '$customer' },
          deliveryPreference: { $first: '$deliveryPreference' },
          tx_ref: { $first: '$tx_ref' },
        },
      },

      {
        $sort: { ['createdAt']: -1 },
      },

      {
        $skip: skip,
      },

      {
        $limit: limit,
      },

      {
        $project: {
          ...projection,
          createdAt: '$createdAt',
          deliveryPreference: '$deliveryPreference',
          tx_ref: '$tx_ref',
        },
      },
    ]);

    return orders;
  } catch (error) {
    return error;
  }
};

export const getOrders = async (req, res, next) => {
  try {
    // Create Query Object
    let filter = {},
      orders;
    // Determine the user role
    const { role, _id } = req.user;

    // Req.params.sellerId: Means request is by admin on GET: '/users/:sellerId/orders
    // No Req.params.sellerId but role === seller: Means request by seller on GET: /orders
    if (req.params.sellerId || role === 'seller') {
      const sellerId = !req.params.sellerId ? _id : req.params.sellerId;
      orders = await fetchSellerOrders(sellerId, req.query);
      return res.status(200).json({
        status: 'success',
        count: orders?.length,
        data: {
          orders,
        },
      });
    }

    // GET: /orders and user is customer: Filter by customer Id
    // If GET: /orders, Role: "admin":  Return all orders
    if (role === 'customer') filter.customer = _id;

    // EXECUTE QUERY
    const features = new APIFeatures(Order.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    if (role === 'customer') orders = await features.query;
    if (role === 'admin')
      orders = await features.query.populate({
        path: 'customer',
        select: 'firstName lastName email id',
      });

    res.status(200).json({
      status: 'success',
      count: orders?.length,
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
    const { error } = orderJoiSchema.validate(req.body, {
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
