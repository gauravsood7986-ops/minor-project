import mongoose from 'mongoose';
import { Inquiry } from '../models/Inquiry.js';
import { Service } from '../models/Service.js';

export const createInquiry = async (req, res, next) => {
  try {
    const { serviceId, message } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'The requested service listing does not exist.',
      });
    }

    if (service.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Cannot send inquiry on an unpublished or paused service.',
      });
    }

    // Prevent owner from inquiring on their own service
    if (service.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send an inquiry on your own service listing.',
      });
    }

    const inquiry = new Inquiry({
      service: service._id,
      sender: req.user._id,
      recipient: service.owner,
      message,
      status: 'pending',
    });

    await inquiry.save();
    await inquiry.populate([
      { path: 'service', select: 'title price currency deliveryTime' },
      { path: 'recipient', select: 'name username college avatar' },
      { path: 'sender', select: 'name username college avatar' },
    ]);

    return res.status(201).json({
      success: true,
      message: 'Inquiry sent successfully to the freelancer.',
      data: { inquiry },
    });
  } catch (error) {
    next(error);
  }
};

export const getSentInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find({ sender: req.user._id })
      .populate('service', 'title price currency deliveryTime status')
      .populate('recipient', 'name username college avatar')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: { inquiries },
    });
  } catch (error) {
    next(error);
  }
};

export const getReceivedInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find({ recipient: req.user._id })
      .populate('service', 'title price currency deliveryTime status')
      .populate('sender', 'name username college avatar email')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: { inquiries },
    });
  } catch (error) {
    next(error);
  }
};

export const getInquiryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inquiry identifier format',
      });
    }

    const inquiry = await Inquiry.findById(id)
      .populate('service', 'title price currency deliveryTime status')
      .populate('sender', 'name username college avatar email')
      .populate('recipient', 'name username college avatar email');

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found',
      });
    }

    const isSender = inquiry.sender._id.toString() === req.user._id.toString();
    const isRecipient = inquiry.recipient._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isSender && !isRecipient && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this inquiry.',
      });
    }

    // Auto mark as read if recipient views it
    if (isRecipient && inquiry.status === 'pending') {
      inquiry.status = 'read';
      await inquiry.save();
    }

    return res.status(200).json({
      success: true,
      data: { inquiry },
    });
  } catch (error) {
    next(error);
  }
};

export const updateInquiryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found',
      });
    }

    const isRecipient = inquiry.recipient.toString() === req.user._id.toString();
    const isSender = inquiry.sender.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isRecipient && !isSender && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to modify this inquiry.',
      });
    }

    inquiry.status = status;
    await inquiry.save();

    return res.status(200).json({
      success: true,
      message: `Inquiry status updated to ${status}`,
      data: { inquiry },
    });
  } catch (error) {
    next(error);
  }
};
