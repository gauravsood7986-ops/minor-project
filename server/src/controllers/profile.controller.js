import { User } from '../models/User.js';
import { Service } from '../models/Service.js';
import { Review } from '../models/Review.js';

export const getProfileByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username: username.toLowerCase() }).select(
      'name username college bio skills languages avatar portfolioLinks socialLinks createdAt'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Freelancer profile not found',
      });
    }

    // Retrieve published services for this profile
    const services = await Service.find({
      owner: user._id,
      status: 'published',
    })
      .sort({ createdAt: -1 })
      .lean();

    // Retrieve actual reviews and calculate rating
    const reviews = await Review.find({ recipient: user._id })
      .populate('reviewer', 'name username avatar')
      .populate('service', 'title')
      .sort({ createdAt: -1 })
      .lean();

    const reviewCount = reviews.length;
    const averageRating =
      reviewCount > 0
        ? Number(
            (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount).toFixed(1)
          )
        : null;

    return res.status(200).json({
      success: true,
      data: {
        profile: {
          ...user.toObject(),
          stats: {
            publishedServicesCount: services.length,
            reviewCount,
            averageRating,
          },
        },
        services,
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    const allowedFields = [
      'name',
      'college',
      'bio',
      'skills',
      'languages',
      'avatar',
      'portfolioLinks',
      'socialLinks',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};
