import mongoose from 'mongoose';
import { Service } from '../models/Service.js';

export const getServices = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const filter = { status: 'published' };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined && !isNaN(Number(minPrice))) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    if (search && search.trim()) {
      const sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: sanitizedSearch, $options: 'i' } },
        { description: { $regex: sanitizedSearch, $options: 'i' } },
        { tags: { $in: [new RegExp(sanitizedSearch, 'i')] } },
      ];
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sort === 'price_asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOptions = { price: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [total, services] = await Promise.all([
      Service.countDocuments(filter),
      Service.find(filter)
        .populate('owner', 'name username college avatar')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        services,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum) || 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service identifier format',
      });
    }

    const service = await Service.findById(id).populate(
      'owner',
      'name username college bio skills avatar portfolioLinks socialLinks createdAt'
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service listing not found',
      });
    }

    // If not published, check if user is the owner or admin
    if (service.status !== 'published') {
      const isOwner = req.user && req.user._id.toString() === service.owner._id.toString();
      const isAdmin = req.user && req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        return res.status(404).json({
          success: false,
          message: 'Service listing not found or not published',
        });
      }
    }

    // Increment view counter in background
    Service.findByIdAndUpdate(id, { $inc: { views: 1 } }).exec();

    return res.status(200).json({
      success: true,
      data: { service },
    });
  } catch (error) {
    next(error);
  }
};

export const createService = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      price,
      currency = 'USD',
      deliveryTime,
      tags = [],
      portfolioAssets = [],
      portfolioUrl = '',
      revisionPolicy = '1 free revision included',
      status = 'published',
    } = req.body;

    const service = new Service({
      owner: req.user._id,
      title,
      description,
      category,
      price,
      currency,
      deliveryTime,
      tags,
      portfolioAssets,
      portfolioUrl,
      revisionPolicy,
      status,
    });

    await service.save();
    await service.populate('owner', 'name username college avatar');

    return res.status(201).json({
      success: true,
      message: 'Service published successfully',
      data: { service },
    });
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service listing not found',
      });
    }

    const isOwner = req.user._id.toString() === service.owner.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only edit services you own.',
      });
    }

    const allowedFields = [
      'title',
      'description',
      'category',
      'price',
      'currency',
      'deliveryTime',
      'tags',
      'portfolioAssets',
      'portfolioUrl',
      'revisionPolicy',
      'status',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        service[field] = req.body[field];
      }
    });

    await service.save();
    await service.populate('owner', 'name username college avatar');

    return res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: { service },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service listing not found',
      });
    }

    const isOwner = req.user._id.toString() === service.owner.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete services you own.',
      });
    }

    await Service.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getMyServices = async (req, res, next) => {
  try {
    const services = await Service.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: { services },
    });
  } catch (error) {
    next(error);
  }
};

export const updateServiceStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service listing not found',
      });
    }

    const isOwner = req.user._id.toString() === service.owner.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update the status of services you own.',
      });
    }

    service.status = status;
    await service.save();

    return res.status(200).json({
      success: true,
      message: `Service status updated to ${status}`,
      data: { service },
    });
  } catch (error) {
    next(error);
  }
};
