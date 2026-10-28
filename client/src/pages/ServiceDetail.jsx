import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Clock,
  ShieldCheck,
  Tag,
  ExternalLink,
  MessageSquare,
  Star,
  Send,
  User,
  CheckCircle,
  FileText,
  AlertCircle,
  Edit,
  ShoppingBag,
  Download,
  Sparkles,
  X,
  Check,
} from 'lucide-react';
import { servicesApi } from '../api/services.api.js';
import { inquiriesApi } from '../api/inquiries.api.js';
import { reviewsApi } from '../api/reviews.api.js';
import { ordersApi } from '../api/orders.api.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { formatCurrency, formatDate, getInitials } from '../utils/formatters.js';
import { getCategoryLabel } from '../utils/categories.js';
import toast from 'react-hot-toast';

export const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useSelector((state) => state.auth);

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inquiry modal / form state
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);

  // Buy service modal & order state
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [buying, setBuying] = useState(false);
  const [purchaseNotes, setPurchaseNotes] = useState('');
  const [purchasedOrder, setPurchasedOrder] = useState(null);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await servicesApi.getServiceById(id);
        setService(res.data?.service);

        // Fetch reviews for owner/service
        if (res.data?.service?.owner?.username) {
          const revRes = await reviewsApi.getReviewsByUsername(res.data.service.owner.username);
          setReviews(
            (revRes.data?.reviews || []).filter(
              (r) => r.service?._id === id || r.service === id
            )
          );
        }
      } catch (err) {
        console.error('Failed to load service details:', err);
        setError(err.message || 'Service not found');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceData();
  }, [id]);

  const handleBuyService = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/services/${id}`);
      return;
    }

    try {
      setBuying(true);
      const res = await ordersApi.createOrder({
        serviceId: service._id,
        notes: purchaseNotes.trim(),
        paymentMethod: 'CampusGig Student Pay (Instant)',
      });
      setPurchasedOrder(res.data.order);
      toast.success('Service purchased successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to complete purchase');
    } finally {
      setBuying(false);
    }
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate(`/login?redirect=/services/${id}`);
      return;
    }

    if (!inquiryMessage.trim() || inquiryMessage.trim().length < 5) {
      toast.error('Inquiry message must be at least 5 characters');
      return;
    }

    try {
      setSendingInquiry(true);
      await inquiriesApi.createInquiry({
        serviceId: service._id,
        message: inquiryMessage.trim(),
      });
      setInquirySuccess(true);
      setInquiryMessage('');
      toast.success('Inquiry sent successfully to the freelancer!');
    } catch (err) {
      toast.error(err.message || 'Failed to send inquiry');
    } finally {
      setSendingInquiry(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate(`/login?redirect=/services/${id}`);
      return;
    }

    if (!reviewComment.trim() || reviewComment.trim().length < 5) {
      toast.error('Review comment must be at least 5 characters');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await reviewsApi.createReview({
        serviceId: service._id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setReviews([res.data.review, ...reviews]);
      setReviewComment('');
      toast.success('Review submitted successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <LoadingSpinner text="Retrieving service listing details..." />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Service Not Found</h2>
        <p className="text-slate-600 mb-6">{error || 'This service listing does not exist or has been removed.'}</p>
        <Link
          to="/services"
          className="inline-flex px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const isOwner = currentUser && currentUser._id === service.owner?._id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <Link to="/" className="hover:text-slate-800">Home</Link>
        <span>/</span>
        <Link to="/services" className="hover:text-slate-800">Services</Link>
        <span>/</span>
        <Link to={`/services?category=${service.category}`} className="hover:text-slate-800">
          {getCategoryLabel(service.category)}
        </Link>
        <span>/</span>
        <span className="text-slate-800 truncate max-w-xs">{service.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details, Portfolio, Description */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {getCategoryLabel(service.category)}
              </span>
              {service.status !== 'published' && (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  Status: {service.status}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {service.title}
            </h1>
          </div>

          {/* Portfolio Media Gallery */}
          {service.portfolioAssets && service.portfolioAssets.length > 0 && (
            <div className="space-y-3">
              {service.portfolioAssets.map((asset, idx) => {
                const isPdf =
                  asset.fileType === 'pdf' ||
                  asset.url?.includes('application/pdf') ||
                  asset.url?.toLowerCase().endsWith('.pdf') ||
                  asset.name?.toLowerCase().endsWith('.pdf');

                if (isPdf) {
                  return (
                    <div
                      key={idx}
                      className="p-6 rounded-2xl bg-gradient-to-br from-rose-50 via-slate-50 to-indigo-50 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
                          <FileText className="w-8 h-8" />
                        </div>
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white mb-1">
                            PDF Document
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1">
                            {asset.name || 'Attached PDF Document'}
                          </h4>
                          {asset.size ? (
                            <p className="text-xs text-slate-500">
                              {(asset.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>View / Open PDF</span>
                      </a>
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[16/10] relative flex items-center justify-center shadow-xs"
                  >
                    <img
                      src={asset.url}
                      alt={asset.name || service.title}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-4">About This Service</h2>
            <div className="prose prose-slate max-w-none text-sm leading-relaxed whitespace-pre-line text-slate-700">
              {service.description}
            </div>

            {/* Revision Policy */}
            {service.revisionPolicy && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Revision Policy
                </h3>
                <p className="text-sm text-slate-600">{service.revisionPolicy}</p>
              </div>
            )}

            {/* External Portfolio URL */}
            {service.portfolioUrl && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <a
                  href={service.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  <span>View Freelancer Portfolio & Samples</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* Tags / Skills */}
            {service.tags && service.tags.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Related Skills & Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium"
                    >
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reviews & Ratings Section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Client Reviews ({reviews.length})
              </h2>
            </div>

            {/* Submit Review (For authenticated clients only, not owner) */}
            {isAuthenticated && !isOwner && (
              <form onSubmit={handleReviewSubmit} className="mb-8 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-semibold text-slate-800">Leave a Review</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className={`p-1 rounded-sm ${
                          star <= reviewRating ? 'text-amber-500' : 'text-slate-300'
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  rows="3"
                  placeholder="Share your experience working with this freelancer..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full p-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-colors"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            )}

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev._id} className="pb-4 border-b border-slate-100 last:border-none">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {rev.reviewer?.avatar?.url ? (
                          <img
                            src={rev.reviewer.avatar.url}
                            alt={rev.reviewer.name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                            {getInitials(rev.reviewer?.name)}
                          </div>
                        )}
                        <span className="text-xs font-semibold text-slate-800">
                          {rev.reviewer?.name || 'Anonymous Client'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 text-xs">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-bold text-slate-800">{rev.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-9">{rev.comment}</p>
                    <span className="text-[10px] text-slate-400 block pl-9 mt-1">
                      {formatDate(rev.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                No reviews yet for this service. Reviews are added by clients who collaborate on this service.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Pricing Box, Inquire Form, Freelancer Card */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm sticky top-24">
            <div className="flex items-baseline justify-between mb-6 pb-5 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Package Price
              </span>
              <span className="text-3xl font-extrabold text-slate-900">
                {formatCurrency(service.price, service.currency)}
              </span>
            </div>

            <div className="space-y-3 mb-6 text-sm text-slate-600">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>
                  Delivery in <strong>{service.deliveryTime} {service.deliveryTime === 1 ? 'day' : 'days'}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Direct student-to-client collaboration</span>
              </div>
            </div>

            {/* Owner Edit Action or Client Buy & Inquiry Options */}
            {isOwner ? (
              <div className="space-y-2">
                <Link
                  to={`/services/${service._id}/edit`}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-xs"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit This Service</span>
                </Link>
                <p className="text-[11px] text-slate-500 text-center">
                  You are the owner of this service listing.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Primary Buy or Claim Free Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate(`/login?redirect=/services/${id}`);
                      return;
                    }
                    setPurchasedOrder(null);
                    setBuyModalOpen(true);
                  }}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 text-white font-bold rounded-xl text-sm transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                    service.price === 0
                      ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-500/20'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5 text-emerald-100" />
                  <span>
                    {service.price === 0
                      ? '⚡ Claim for Free & Access Now'
                      : `Buy Now — ${formatCurrency(service.price, service.currency)}`}
                  </span>
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    or
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                {/* Secondary Inquiry Section */}
                {!showInquiryForm && !inquirySuccess ? (
                  <button
                    type="button"
                    onClick={() => setShowInquiryForm(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs border border-slate-200 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-slate-500" />
                    <span>Send Inquiry / Ask Question</span>
                  </button>
                ) : inquirySuccess ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-2">
                    <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto" />
                    <p className="text-xs font-semibold">Inquiry Dispatched!</p>
                    <p className="text-[11px] text-emerald-700">
                      The freelancer has received your message in their workspace.
                    </p>
                    <button
                      onClick={() => {
                        setInquirySuccess(false);
                        setShowInquiryForm(false);
                      }}
                      className="text-xs font-bold text-emerald-800 underline mt-2"
                    >
                      Close inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Inquiry Message
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowInquiryForm(false)}
                        className="text-[11px] text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                    <textarea
                      rows="3"
                      required
                      placeholder="Hi, I would like to inquire about this service. What is your availability this week?..."
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={sendingInquiry}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{sendingInquiry ? 'Sending...' : 'Contact Freelancer'}</span>
                    </button>
                    {!isAuthenticated && (
                      <p className="text-[11px] text-slate-500 text-center">
                        You will be directed to sign in before sending.
                      </p>
                    )}
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Freelancer Mini Profile Card */}
          {service.owner && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                About the Freelancer
              </h3>
              <div className="flex items-center gap-3.5 mb-4">
                {service.owner.avatar?.url ? (
                  <img
                    src={service.owner.avatar.url}
                    alt={service.owner.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-base flex items-center justify-center">
                    {getInitials(service.owner.name)}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-tight">
                    {service.owner.name}
                  </h4>
                  <p className="text-xs text-slate-500">@{service.owner.username}</p>
                  {service.owner.college && (
                    <p className="text-[11px] text-indigo-700 font-medium mt-0.5">
                      {service.owner.college}
                    </p>
                  )}
                </div>
              </div>

              {service.owner.bio && (
                <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
                  {service.owner.bio}
                </p>
              )}

              <Link
                to={`/profiles/${service.owner.username}`}
                className="w-full flex items-center justify-center py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-xl transition-colors"
              >
                View Full Freelancer Profile
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Checkout & Purchase Modal */}
      {buyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-slate-100 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => {
                if (!buying) setBuyModalOpen(false);
              }}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {purchasedOrder ? (
              /* Success State after Purchase */
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Payment Successful
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-2">
                    Purchase Confirmed!
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Order #{purchasedOrder._id.slice(-6).toUpperCase()} • {formatCurrency(purchasedOrder.price, purchasedOrder.currency)}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2">
                  <p className="text-xs font-semibold text-slate-800">
                    Service: {purchasedOrder.title}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Seller: <strong>{service.owner?.name}</strong> (@{service.owner?.username})
                  </p>
                  <p className="text-[11px] text-slate-500">
                    A notification message has also been sent to the seller in CampusGig messages.
                  </p>
                </div>

                {/* Instant Download Section if Files/Notes Attached */}
                {purchasedOrder.downloadAssets && purchasedOrder.downloadAssets.length > 0 && (
                  <div className="space-y-2 pt-2 text-left">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Instant Download Available:</span>
                    </h4>
                    {purchasedOrder.downloadAssets.map((asset, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/60 border border-indigo-100"
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                          <span className="text-xs font-semibold text-slate-900 truncate">
                            {asset.name || 'Attached Notes / Resource'}
                          </span>
                        </div>
                        <a
                          href={asset.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/dashboard/purchases"
                    className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs text-center"
                  >
                    View in My Purchases
                  </Link>
                  <button
                    type="button"
                    onClick={() => setBuyModalOpen(false)}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* Checkout Form State */
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{service.price === 0 ? 'Free Community Resource' : 'Instant Student Checkout'}</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {service.price === 0 ? 'Claim Free Resource' : 'Confirm Your Purchase'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {service.price === 0
                      ? 'Zero-cost instant access. Download materials immediately and collaborate with the creator.'
                      : 'Direct purchase with guaranteed seller communication and file downloads.'}
                  </p>
                </div>

                {/* Service Details Recap */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {getCategoryLabel(service.category)}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">
                        {service.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Seller: {service.owner?.name} {service.owner?.college ? `• ${service.owner.college}` : ''}
                      </p>
                    </div>
                    <span className="text-xl font-black text-slate-900 shrink-0">
                      {formatCurrency(service.price, service.currency)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Delivery in {service.deliveryTime} {service.deliveryTime === 1 ? 'day' : 'days'}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Student Protection</span>
                    </span>
                  </div>
                </div>

                {/* Buyer Instructions Note */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Instructions or Requests for Seller (Optional)
                  </label>
                  <textarea
                    rows="3"
                    value={purchaseNotes}
                    onChange={(e) => setPurchaseNotes(e.target.value)}
                    placeholder="e.g. Please send lecture notes chapters 1-4, or schedule tutoring for Thursday..."
                    className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                {/* Price Breakdown */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Item Price</span>
                    <span className="font-semibold">{formatCurrency(service.price, service.currency)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Student Marketplace Fee</span>
                    <span className="text-emerald-600 font-semibold">{formatCurrency(0, service.currency)} (Free)</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900 text-sm">
                    <span>Total Due</span>
                    <span className={service.price === 0 ? 'text-emerald-600 font-extrabold' : ''}>
                      {service.price === 0 ? 'FREE (₹0 / $0)' : formatCurrency(service.price, service.currency)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setBuyModalOpen(false)}
                    disabled={buying}
                    className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleBuyService}
                    disabled={buying}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    {buying ? (
                      <span>Processing...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{service.price === 0 ? 'Confirm & Claim for Free' : 'Confirm & Buy'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
