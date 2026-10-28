import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Inquiry must reference a service'],
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Inquiry must have a sender'],
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Inquiry must have a recipient'],
      index: true,
    },
    message: {
      type: String,
      required: [true, 'Inquiry message is required'],
      trim: true,
      minlength: [5, 'Message must be at least 5 characters'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'read', 'replied', 'closed'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for user query efficiency
inquirySchema.index({ recipient: 1, createdAt: -1 });
inquirySchema.index({ sender: 1, createdAt: -1 });
inquirySchema.index({ service: 1, sender: 1 });

export const Inquiry = mongoose.model('Inquiry', inquirySchema);
