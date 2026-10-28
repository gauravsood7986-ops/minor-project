import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { UploadCloud, X, FileCheck, ArrowRight, Trash2, FileText } from 'lucide-react';
import { servicesApi } from '../api/services.api.js';
import { uploadsApi } from '../api/uploads.api.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { CATEGORIES } from '../utils/categories.js';
import { CURRENCIES } from '../utils/currencies.js';
import toast from 'react-hot-toast';

const serviceEditSchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(20).max(5000),
  category: z.string().min(1),
  price: z.coerce.number().min(1).max(5000000),
  currency: z.string().default('INR'),
  deliveryTime: z.coerce.number().int().min(1).max(90),
  portfolioUrl: z.string().url().or(z.literal('')).optional(),
  revisionPolicy: z.string().max(500).optional(),
  status: z.enum(['published', 'draft', 'paused', 'archived']),
});

export const EditService = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [portfolioAssets, setPortfolioAssets] = useState([]);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(serviceEditSchema),
  });

  const currentPrice = watch('price');
  const selectedCurrency = watch('currency') || 'INR';
  const isFree = Number(currentPrice) === 0;

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const res = await servicesApi.getServiceById(id);
        const service = res.data?.service;

        if (!service) {
          toast.error('Service not found');
          navigate('/dashboard/services');
          return;
        }

        // Ownership enforcement check
        if (service.owner?._id !== currentUser?._id && currentUser?.role !== 'admin') {
          toast.error('Forbidden: You can only edit your own services');
          navigate('/dashboard/services');
          return;
        }

        reset({
          title: service.title,
          description: service.description,
          category: service.category,
          price: service.price,
          currency: service.currency || 'INR',
          deliveryTime: service.deliveryTime,
          portfolioUrl: service.portfolioUrl || '',
          revisionPolicy: service.revisionPolicy || '1 free revision included',
          status: service.status,
        });

        setTags(service.tags || []);
        setPortfolioAssets(service.portfolioAssets || []);
      } catch (err) {
        toast.error(err.message || 'Failed to load service');
        navigate('/dashboard/services');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchService();
    }
  }, [id, currentUser, reset, navigate]);

  const handleAddTag = (e) => {
    e.preventDefault();
    const clean = tagInput.trim().toLowerCase();
    if (clean && !tags.includes(clean) && tags.length < 8) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await uploadsApi.uploadFile(file);
      if (res.data?.upload) {
        const isImg = file.type.startsWith('image/');
        const detectedType = res.data.upload.fileType || (isImg ? 'image' : 'pdf');

        setPortfolioAssets([
          ...portfolioAssets,
          {
            url: res.data.upload.url,
            name: res.data.upload.name,
            fileType: detectedType,
            public_id: res.data.upload.public_id,
            size: res.data.upload.size,
          },
        ]);
        toast.success(`${isImg ? 'Image' : 'Document'} uploaded and attached`);
      }
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      await servicesApi.updateService(id, {
        ...values,
        tags,
        portfolioAssets,
      });
      toast.success('Service updated successfully');
      navigate(`/services/${id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update service');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to permanently delete this service listing?')) {
      try {
        await servicesApi.deleteService(id);
        toast.success('Service deleted successfully');
        navigate('/dashboard/services');
      } catch (err) {
        toast.error(err.message || 'Failed to delete service');
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <LoadingSpinner text="Loading service details..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Edit Service Listing
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Update pricing, description, delivery time, or publication status.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Listing</span>
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 sm:p-10 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Service Title *
          </label>
          <input
            type="text"
            {...register('title')}
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Category *
            </label>
            <select
              {...register('category')}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            >
              {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Status *
            </label>
            <select
              {...register('status')}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Pricing Type Toggle: Paid vs Free */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Listing Pricing Model *
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Switch between paid service and free community resource.
              </p>
            </div>

            <div className="inline-flex rounded-xl p-1 bg-slate-200/80 gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setValue('price', currentPrice === 0 ? 499 : currentPrice)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  !isFree
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Paid Listing
              </button>
              <button
                type="button"
                onClick={() => setValue('price', 0)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isFree
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Free Resource (₹0 / $0)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 border-t border-slate-200">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Currency *
              </label>
              <select
                {...register('currency')}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-medium cursor-pointer"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Price Amount *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="5000000"
                  disabled={isFree}
                  {...register('price')}
                  className={`w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                    isFree ? 'bg-slate-100 text-slate-500 cursor-not-allowed font-semibold' : 'bg-white font-semibold'
                  }`}
                />
                {isFree && (
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-emerald-600">
                    FREE
                  </span>
                )}
              </div>
              {errors.price && <p className="text-xs text-rose-500 mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Delivery Days *
              </label>
              <input
                type="number"
                min="1"
                max="90"
                {...register('deliveryTime')}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {errors.deliveryTime && <p className="text-xs text-rose-500 mt-1">{errors.deliveryTime.message}</p>}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Service Description *
          </label>
          <textarea
            rows="6"
            {...register('description')}
            className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Portfolio Assets */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Portfolio Samples
          </label>
          <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 mb-3">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="text-xs text-slate-500 cursor-pointer"
            />
          </div>

          {portfolioAssets.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {portfolioAssets.map((asset, idx) => {
                const isDoc =
                  asset.fileType === 'pdf' ||
                  asset.url?.includes('application/pdf') ||
                  asset.name?.toLowerCase().endsWith('.pdf') ||
                  asset.url?.toLowerCase().endsWith('.pdf');

                return (
                  <div key={idx} className="relative rounded-xl border border-slate-200 overflow-hidden p-2 text-center text-xs bg-white">
                    {!isDoc ? (
                      <img
                        src={asset.url}
                        alt={asset.name}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        className="w-full h-16 object-cover rounded-lg mb-1"
                      />
                    ) : (
                      <div className="w-full h-16 bg-rose-50 rounded-lg flex flex-col items-center justify-center text-rose-500 mb-1 border border-rose-100">
                        <FileText className="w-5 h-5 mb-0.5 text-rose-600" />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-rose-700">PDF Doc</span>
                      </div>
                    )}
                    <p className="truncate text-[10px] text-slate-600">{asset.name || 'Sample'}</p>
                    <button
                      type="button"
                      onClick={() => setPortfolioAssets(portfolioAssets.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 p-1 bg-white/90 text-rose-500 rounded-full hover:bg-rose-50"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard/services')}
            className="px-5 py-2.5 text-slate-600 hover:text-slate-900 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-7 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors shadow-xs flex items-center gap-2"
          >
            <span>{submitting ? 'Saving...' : 'Save Changes'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
