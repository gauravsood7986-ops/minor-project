import mongoose from 'mongoose';

const uploadSchema = new mongoose.Schema(
  {
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Upload must belong to a user'],
      index: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      default: '',
    },
    provider: {
      type: String,
      enum: ['cloudinary', 'local', 'data_uri'],
      default: 'cloudinary',
    },
    associatedService: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

uploadSchema.index({ uploader: 1, createdAt: -1 });

export const Upload = mongoose.model('Upload', uploadSchema);
