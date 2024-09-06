import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const activity = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['security', 'product', 'user', 'order'],
    },

    action: {
      type: String,
      required: true,
      enum: [
        'login',
        'logout',
        'order_placed',
        'product_viewed',
        'profile_update',
        'password_change',
        'password_reset',
        'product_viewed',
        'product_added',
        'product_updated',
        'user_role_updated',
        'featured_product',
        'unauthorized_error',
      ],
    },
  },
  { _id: false }
);

const activityLogSchema = new Schema({
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
