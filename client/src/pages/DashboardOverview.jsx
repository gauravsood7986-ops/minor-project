import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Briefcase,
  CheckCircle,
  FileText,
  Mail,
  Send,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  PackageOpen,
  ShoppingBag,
  Download,
} from 'lucide-react';
import { servicesApi } from '../api/services.api.js';
import { inquiriesApi } from '../api/inquiries.api.js';
import { ordersApi } from '../api/orders.api.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { formatDate, formatCurrency } from '../utils/formatters.js';

export const DashboardOverview = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalServices: 0,
    publishedServices: 0,
    draftServices: 0,
    receivedInquiries: 0,
    sentInquiries: 0,
    purchasesCount: 0,
  });
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [recentServices, setRecentServices] = useState([]);
  const [recentInquiries, setRecentInquiries] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [servicesRes, receivedRes, sentRes, purchasesRes] = await Promise.all([
          servicesApi.getMyServices(),
          inquiriesApi.getReceivedInquiries(),
          inquiriesApi.getSentInquiries(),
          ordersApi.getMyPurchases(),
        ]);

        const myServices = servicesRes.data?.services || [];
        const received = receivedRes.data?.inquiries || [];
        const sent = sentRes.data?.inquiries || [];
        const purchases = purchasesRes.data?.orders || [];

        setStats({
          totalServices: myServices.length,
          publishedServices: myServices.filter((s) => s.status === 'published').length,
          draftServices: myServices.filter((s) => s.status === 'draft' || s.status === 'paused').length,
          receivedInquiries: received.length,
          sentInquiries: sent.length,
          purchasesCount: purchases.length,
        });

        setRecentServices(myServices.slice(0, 3));
        setRecentInquiries(received.slice(0, 3));
        setRecentPurchases(purchases.slice(0, 3));
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Aggregating your workspace activity..." />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10">
          <span className="text-xs uppercase tracking-wider font-semibold text-indigo-300">
            Student Freelance Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
            Manage your service offerings, reply to client inquiries, and build your freelance track record.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/services/publish"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Offer a New Service</span>
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition-colors"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Database-Driven Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          to="/dashboard/purchases"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-colors block"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              My Purchases
            </span>
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-bold text-slate-900">{stats.purchasesCount}</span>
          <span className="text-[11px] text-blue-600 font-medium block mt-1">Resources bought →</span>
        </Link>

        <Link
          to="/dashboard/services"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-colors block"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              My Store Items
            </span>
            <Briefcase className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold text-slate-900">{stats.totalServices}</span>
          <span className="text-[11px] text-emerald-600 font-medium block mt-1">Resources selling →</span>
        </Link>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Sales Inquiries
            </span>
            <Mail className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-bold text-slate-900">{stats.receivedInquiries}</span>
          <span className="text-[11px] text-slate-400 block mt-1">From interested buyers</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Sent Inquiries
            </span>
            <Send className="w-4 h-4 text-sky-500" />
          </div>
          <span className="text-2xl font-bold text-slate-900">{stats.sentInquiries}</span>
          <span className="text-[11px] text-slate-400 block mt-1">To other student peers</span>
        </div>
      </div>

      {/* Recent Purchases (Bought Items) */}
      {recentPurchases.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Your Recent Purchases</h2>
            </div>
            <Link
              to="/dashboard/purchases"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View all ({stats.purchasesCount})
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentPurchases.map((order) => (
              <div
                key={order._id}
                className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <Link
                    to={`/services/${order.service?._id || order.service}`}
                    className="text-sm font-semibold text-slate-900 hover:text-indigo-600 truncate block"
                  >
                    {order.title}
                  </Link>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span className="text-emerald-700 font-semibold">{formatCurrency(order.price, order.currency)}</span>
                    <span>•</span>
                    <span>Seller: {order.seller?.name || 'Student'}</span>
                    <span>•</span>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {order.downloadAssets && order.downloadAssets.length > 0 && (
                    <a
                      href={order.downloadAssets[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs rounded-lg transition-colors border border-blue-200"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      <span>Download</span>
                    </a>
                  )}
                  <Link
                    to="/dashboard/purchases"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Services List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">Your Services</h2>
          <Link
            to="/dashboard/services"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Manage all ({stats.totalServices})
          </Link>
        </div>

        {recentServices.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentServices.map((service) => (
              <div
                key={service._id}
                className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <Link
                    to={`/services/${service._id}`}
                    className="text-sm font-semibold text-slate-900 hover:text-indigo-600 truncate block"
                  >
                    {service.title}
                  </Link>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="capitalize">{service.category.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>{formatDate(service.createdAt)}</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">
                      {formatCurrency(service.price, service.currency)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      service.status === 'published'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {service.status}
                  </span>
                  <Link
                    to={`/services/${service._id}/edit`}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            <PackageOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="font-medium text-slate-700 mb-1">You haven't published any services yet</p>
            <p className="max-w-xs mx-auto mb-4">
              Offer your academic tutoring, programming, or design skills to clients on CampusGig.
            </p>
            <Link
              to="/services/publish"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Offer First Service</span>
            </Link>
          </div>
        )}
      </div>

      {/* Recent Inquiries Preview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">Recent Inquiries Received</h2>
          <Link
            to="/dashboard/inquiries"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            View all ({stats.receivedInquiries})
          </Link>
        </div>

        {recentInquiries.length > 0 ? (
          <div className="space-y-3">
            {recentInquiries.map((inq) => (
              <div
                key={inq._id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800">
                    From: {inq.sender?.name} (@{inq.sender?.username})
                  </p>
                  <p className="text-slate-500 truncate mt-0.5">{inq.message}</p>
                </div>
                <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white border border-slate-200 capitalize">
                  {inq.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic py-4 text-center">
            You haven't received any client inquiries yet. When clients contact you about your services, they will appear here.
          </p>
        )}
      </div>
    </div>
  );
};
