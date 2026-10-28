import { Order } from '../models/Order.js';
import { Service } from '../models/Service.js';
import { Inquiry } from '../models/Inquiry.js';

/**
 * Place a new order / Buy a service
 * POST /api/orders
 */
export const createOrder = async (req, res, next) => {
  try {
    const { serviceId, notes = '', paymentMethod = 'CampusGig Student Pay (Instant)' } = req.body;
    const buyerId = req.user._id;

    // Fetch the target service
    const service = await Service.findById(serviceId).populate('owner', 'name email username');
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'The requested service listing was not found.',
      });
    }

    // Ownership guard: Prevent buying your own service
    if (service.owner._id.toString() === buyerId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot purchase your own service or resource listing.',
      });
    }

    // Copy any attachments (notes/PDFs/images) so the buyer has direct download access
    const downloadAssets = (service.portfolioAssets || []).map((asset) => ({
      url: asset.url,
      name: asset.name || service.title,
      fileType: asset.fileType || 'file',
      size: asset.size || 0,
    }));

    // Create the order
    const order = new Order({
      service: service._id,
      buyer: buyerId,
      seller: service.owner._id,
      title: service.title,
      category: service.category,
      price: service.price,
      currency: service.currency || 'USD',
      deliveryTime: service.deliveryTime || 1,
      status: 'completed',
      paymentStatus: 'paid',
      paymentMethod,
      notes: notes.trim(),
      downloadAssets,
    });

    await order.save();

    // Automatically create a record/notification inquiry so seller is immediately notified
    try {
      await Inquiry.create({
        service: service._id,
        sender: buyerId,
        recipient: service.owner._id,
        message: `[ORDER COMPLETED #${order._id.toString().slice(-6).toUpperCase()}] Hi ${service.owner.name}! I just purchased "${service.title}" for $${service.price}. ${notes ? `Notes from buyer: ${notes}` : ''}`,
        status: 'pending',
      });
    } catch (inquiryErr) {
      // Non-fatal if inquiry creation fails
      console.warn('Could not auto-generate purchase inquiry:', inquiryErr.message);
    }

    // Populate for response
    await order.populate([
      { path: 'buyer', select: 'name username email avatar college' },
      { path: 'seller', select: 'name username email avatar college' },
      { path: 'service', select: 'title category price currency deliveryTime portfolioAssets' },
    ]);

    return res.status(201).json({
      success: true,
      message: 'Service purchased successfully!',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all orders where the authenticated user is the buyer (What I have bought)
 * GET /api/orders/my-purchases
 */
export const getMyPurchases = async (req, res, next) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('seller', 'name username email avatar college')
      .populate('service', 'title category price currency deliveryTime portfolioAssets')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all orders where the authenticated user is the seller (What I have sold)
 * GET /api/orders/my-sales
 */
export const getMySales = async (req, res, next) => {
  try {
    const orders = await Order.find({ seller: req.user._id })
      .populate('buyer', 'name username email avatar college')
      .populate('service', 'title category price currency deliveryTime')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single order details with access control
 * GET /api/orders/:id
 */
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate('buyer', 'name username email avatar college')
      .populate('seller', 'name username email avatar college')
      .populate('service');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // Security check: Must be buyer or seller
    const isBuyer = order.buyer._id.toString() === req.user._id.toString();
    const isSeller = order.seller._id.toString() === req.user._id.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this order.',
      });
    }

    return res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};
