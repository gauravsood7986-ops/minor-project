import { Review } from '../models/Review.js';
import { Service } from '../models/Service.js';
import { User } from '../models/User.js';

export const createReview = async (req, res, next) => {
  try {
    const { serviceId, rating, comment } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service listing not found',
      });
    }

    // Cannot review own service
    if (service.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot write a review on your own service listing.',
      });
    }

    // Check for existing review by this user on this service
    const existingReview = await Review.findOne({
      reviewer: req.user._id,
      service: service._id,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a review for this service.',
      });
    }

    const review = new Review({
      reviewer: req.user._id,
      recipient: service.owner,
      service: service._id,
      rating,
      comment,
    });

    await review.save();
    await review.populate([
      { path: 'reviewer', select: 'name username avatar' },
      { path: 'service', select: 'title' },
    ]);

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

export const getReviewsByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Freelancer not found',
      });
    }

    const reviews = await Review.find({ recipient: user._id })
      .populate('reviewer', 'name username avatar')
      .populate('service', 'title')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: { reviews },
    });
  } catch (error) {
    next(error);
  }
};
