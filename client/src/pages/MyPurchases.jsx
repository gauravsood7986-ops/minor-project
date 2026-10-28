import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Download,
  FileText,
  Clock,
  User,
  ExternalLink,
  CheckCircle,
  MessageSquare,
  PackageOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { ordersApi } from '../api/orders.api.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { formatDate, formatCurrency, getInitials } from '../utils/formatters.js';

export const MyPurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await ordersApi.getMyPurchases();
        setPurchases(res.data?.orders || []);
      } catch (err) {
        console.error('Failed to load purchases:', err);
        setError(err.message || 'Could not load your purchases');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Retrieving your purchased resources and services..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Purchases & Bought Resources
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Access study notes, downloadable files, and view services you have purchased from classmates.
          </p>
        </div>
        <Link
          to="/services"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Browse More to Buy</span>
        </Link>
      </div>

      {purchases.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="No purchases yet"
          description="You haven't bought any study notes, guides, or hired student freelancers yet. Browse the marketplace to find resources!"
          actionLabel="Explore Marketplace"
          actionLink="/services"
        />
      ) : (
        <div className="space-y-4">
          {purchases.map((order) => {
            const hasDownloads = order.downloadAssets && order.downloadAssets.length > 0;

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:border-indigo-200 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Paid & Completed
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Order #{order._id.slice(-6).toUpperCase()} • {formatDate(order.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                      <Link to={`/services/${order.service?._id || order.service}`}>
                        {order.title}
                      </Link>
                    </h3>

                    {order.seller && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-600">
                        <span>Sold by:</span>
                        <Link
                          to={`/profiles/${order.seller.username}`}
                          className="font-semibold text-slate-800 hover:text-indigo-600 flex items-center gap-1.5"
                        >
                          {order.seller.avatar?.url ? (
                            <img
                              src={order.seller.avatar.url}
                              alt={order.seller.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center">
                              {getInitials(order.seller.name)}
                            </div>
                          )}
                          <span>{order.seller.name}</span>
                          {order.seller.college && (
                            <span className="text-[10px] text-slate-400">
                              ({order.seller.college})
                            </span>
                          )}
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Price & Primary Action */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                    <span className="text-2xl font-black text-slate-900">
                      {formatCurrency(order.price, order.currency)}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {order.paymentMethod || 'CampusGig Student Pay'}
                    </span>
                  </div>
                </div>

                {/* Downloadable Notes / Files Section */}
                {hasDownloads && (
                  <div className="mt-4 pt-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Included Downloadable Materials ({order.downloadAssets.length})</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {order.downloadAssets.map((asset, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <FileText className="w-5 h-5 text-rose-500 shrink-0" />
                            <span className="text-xs font-semibold text-slate-800 truncate">
                              {asset.name || `Document #${idx + 1}`}
                            </span>
                          </div>
                          <a
                            href={asset.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Buyer Notes (if any) */}
                {order.notes && (
                  <div className="mt-3 p-3 bg-amber-50/60 border border-amber-100 rounded-xl text-xs text-amber-900">
                    <span className="font-semibold">Your Note: </span>
                    <span>{order.notes}</span>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Verified Purchase Receipt</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/services/${order.service?._id || order.service}`}
                      className="font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      View Original Listing & Leave Review
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
