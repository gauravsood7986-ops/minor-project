import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  PauseCircle,
  PackageOpen,
  Clock,
} from 'lucide-react';
import { servicesApi } from '../api/services.api.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { getCategoryLabel } from '../utils/categories.js';
import toast from 'react-hot-toast';

export const MyServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyServices = async () => {
    try {
      setLoading(true);
      const res = await servicesApi.getMyServices();
      setServices(res.data?.services || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load your services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyServices();
  }, []);

  const handleToggleStatus = async (service) => {
    const nextStatus = service.status === 'published' ? 'paused' : 'published';
    try {
      await servicesApi.updateServiceStatus(service._id, nextStatus);
      toast.success(`Service status updated to ${nextStatus}`);
      setServices(
        services.map((s) => (s._id === service._id ? { ...s, status: nextStatus } : s))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      try {
        await servicesApi.deleteService(id);
        toast.success('Service deleted successfully');
        setServices(services.filter((s) => s._id !== id));
      } catch (err) {
        toast.error(err.message || 'Failed to delete service');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving your service listings..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Services
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
            Manage your service listings, toggle visibility, and update pricing.
          </p>
        </div>
        <Link
          to="/services/publish"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish New Service</span>
        </Link>
      </div>

      {services.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="px-5 py-3.5">Service</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Price</th>
                  <th className="px-4 py-3.5">Delivery</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Date Created</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((service) => (
                  <tr key={service._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 max-w-xs">
                      <Link
                        to={`/services/${service._id}`}
                        className="font-bold text-slate-900 hover:text-indigo-600 line-clamp-1"
                      >
                        {service.title}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {getCategoryLabel(service.category)}
                    </td>
                    <td className="px-4 py-4 font-bold text-slate-900">
                      {formatCurrency(service.price, service.currency)}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {service.deliveryTime} {service.deliveryTime === 1 ? 'day' : 'days'}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                          service.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : service.status === 'paused'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {service.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-500">
                      {formatDate(service.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Pause / Publish Toggle */}
                        <button
                          onClick={() => handleToggleStatus(service)}
                          title={service.status === 'published' ? 'Pause Service' : 'Publish Service'}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          {service.status === 'published' ? (
                            <PauseCircle className="w-4 h-4 text-amber-500" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                          )}
                        </button>

                        {/* Edit */}
                        <Link
                          to={`/services/${service._id}/edit`}
                          title="Edit Service"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        {/* View */}
                        <Link
                          to={`/services/${service._id}`}
                          title="View Listing"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(service._id, service.title)}
                          title="Delete Listing"
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={PackageOpen}
          title="You haven't published any services yet"
          description="Create your first student freelance service listing to start offering your tutoring, design, or programming skills."
          actionLabel="Publish a Service"
          actionLink="/services/publish"
        />
      )}
    </div>
  );
};
