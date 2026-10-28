import mongoose from 'mongoose';

export const SERVICE_CATEGORIES = [
  'study_notes',
  'tutoring',
  'writing',
  'graphic_design',
  'web_development',
  'programming',
  'video_editing',
  'photography',
  'digital_marketing',
  'ui_ux_design',
  'translation',
  'presentation_design',
  'other',
];

const portfolioAssetSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    public_id: { type: String, default: '' },
    fileType: { type: String, default: 'image' },
    name: { type: String, default: '' },
    size: { type: Number, default: 0 },
  },
  { _id: true }
);

const serviceSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Service must belong to an owner'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: SERVICE_CATEGORIES,
        message: 'Invalid category specified',
      },
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      max: [5000000, 'Price cannot exceed 5,000,000'],
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      trim: true,
      enum: ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    },
    deliveryTime: {
      type: Number,
      required: [true, 'Delivery time is required'],
      min: [1, 'Delivery time must be at least 1 day'],
      max: [90, 'Delivery time cannot exceed 90 days'],
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    portfolioAssets: {
      type: [portfolioAssetSchema],
      default: [],
    },
    portfolioUrl: {
      type: String,
      trim: true,
      default: '',
    },
    revisionPolicy: {
      type: String,
      trim: true,
      default: '1 free revision included',
      maxlength: [500, 'Revision policy cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'paused', 'archived'],
      default: 'published',
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Slug generator pre-save
serviceSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    const baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    this.slug = `${baseSlug}-${randomSuffix}`;
  }
  next();
});

// Compound indexes for searching, category filtering, and price sorting
serviceSchema.index({ status: 1, category: 1, price: 1 });
serviceSchema.index({ status: 1, createdAt: -1 });
serviceSchema.index(
  {
    title: 'text',
    description: 'text',
    tags: 'text',
  },
  {
    weights: {
      title: 10,
      tags: 5,
      description: 1,
    },
    name: 'ServiceTextIndex',
  }
);

export const Service = mongoose.model('Service', serviceSchema);
