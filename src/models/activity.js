import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const activity = new Schema(
  {
    type: {
      type: String,
      require: true,
      // Admin will query all activities with type system, any activity that change the whole system. Eg an new category created.
      // User will query all activities with type user, any activity that change the user. Eg a user updated his profile.
      // Security will query all activities with type security, any activity that is security related. Eg a user tried to login with wrong password. Nb: This is not the same as unauthorized access attempt
      // *IN SECURITY* Allow admin to query also unauthorized access attempt
      enum: ['system', 'user', 'security'],
    },

    action: {
      type: String,
      required: true,
      enum: [
        'login',
        'logout',
        'category_created',
        'category_updated',
        'category_deleted',
        'subcategory_created',
        'subcategory_updated',
        'subcategory_deleted',
        'productclass_created',
        'productclass_updated',
        'productclass_deleted',
        'order_placed',
        'product_viewed',
        'profile_update',
        'password_change',
        'password_reset',
        'product_viewed',
        'product_created',
        'product_updated',
        'user_role_updated',
        'featured_product',
        'unauthorized_access_attempt',
      ],
    },
  },
  { _id: false }
);

const resource = new Schema(
  {
    name: {
      type: String,
      // The name of the resource that can be used to query it EX: orders/id
      enum: ['products', 'categories', 'users', 'orders', 'subcategories', 'product-classes', 'user-profiles'],
    },
    id: String,
  },
  { _id: false }
);

const activityLogSchema = new Schema({
  // NB: The user ID is the ID of the user who performed the activity
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  activity: {
    type: activity,
    required: true,
  },
  details: {
    type: String,
    required: false,
  },
  resource,
  timestamp: {
    type: Date,
    default: Date.now,
  },
  ipAddress: {
    type: String,
    required: false,
  },
  userAgent: {
    os: {
      type: String,
      required: false,
    },
    browser: {
      type: String,
      required: false,
    },
  },
  status: {
    type: String,
    required: false,
    enum: ['success', 'failure'],
  },
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
