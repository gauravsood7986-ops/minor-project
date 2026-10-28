import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Order must reference a service'],
      index: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Order must have a buyer'],
      index: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Order must have a seller'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Order title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
    },
    deliveryTime: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['completed', 'in_progress', 'delivered', 'cancelled'],
      default: 'completed',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'refunded'],
      default: 'paid',
      index: true,
    },
    paymentMethod: {
      type: String,
      default: 'CampusGig Student Pay (Instant)',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    downloadAssets: [
      {
        url: { type: String, required: true },
        name: { type: String, default: '' },
        fileType: { type: String, default: 'file' },
        size: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Query optimization indexes
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, createdAt: -1 });
orderSchema.index({ service: 1, buyer: 1 });

export const Order = mongoose.model('Order', orderSchema);
