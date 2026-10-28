import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  X,
  FileCheck,
  AlertCircle,
  Plus,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { servicesApi } from '../api/services.api.js';
import { uploadsApi } from '../api/uploads.api.js';
import { CATEGORIES } from '../utils/categories.js';
import { CURRENCIES } from '../utils/currencies.js';
import toast from 'react-hot-toast';

const servicePublishSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(120, 'Title cannot exceed 120 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description cannot exceed 5000 characters'),
  category: z.string().min(1, 'Please select a valid category'),
  price: z.coerce.number().min(0, 'Price cannot be negative').max(5000000),
  currency: z.string().default('INR'),
  deliveryTime: z.coerce
    .number()
    .int('Delivery time must be whole days')
    .min(1, 'Delivery must be at least 1 day')
    .max(90, 'Delivery time cannot exceed 90 days'),
  portfolioUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  revisionPolicy: z.string().max(500).optional(),
  status: z.enum(['published', 'draft']).default('published'),
});

export const PublishService = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Upload state
  const [portfolioAssets, setPortfolioAssets] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(servicePublishSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'tutoring',
      price: 499,
      currency: 'INR',
      deliveryTime: 2,
      portfolioUrl: '',
      revisionPolicy: '1 free revision included',
      status: 'published',
    },
  });

  const currentPrice = watch('price');
  const isFree = Number(currentPrice) === 0;

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

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds the 5MB limit');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(10);
      const res = await uploadsApi.uploadFile(file, (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        setUploadProgress(percentCompleted);
      });

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
        toast.success(`${isImg ? 'Image' : 'Document'} attached successfully`);
      }
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const handleRemoveAsset = (index) => {
    setPortfolioAssets(portfolioAssets.filter((_, i) => i !== index));
  };

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      const payload = {
        ...values,
        tags,
        portfolioAssets,
      };

      const res = await servicesApi.createService(payload);
      toast.success('Service listing published successfully!');
      navigate(`/services/${res.data.service._id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to publish service');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Publish a Resource or Service to Sell
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          List your study notes, course cheat sheets, exam guides, or offer freelance services like tutoring, coding, and design.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 sm:p-10 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Listing Title *
          </label>
          <input
            type="text"
            {...register('title')}
            placeholder="e.g. Python Complete Semester Notes & Code Cheatsheet (PDF) or Calculus Tutoring"
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          {errors.title && (
            <p className="text-xs text-rose-500 mt-1">{errors.title.message}</p>
          )}
          <p className="text-[11px] text-slate-400 mt-1">
            Clearly describe what resource (e.g. PDF notes, study summary) or freelance service you are providing.
          </p>
        </div>

        {/* Category & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Service Category *
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
            {errors.category && (
              <p className="text-xs text-rose-500 mt-1">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Publication Status *
            </label>
            <select
              {...register('status')}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            >
              <option value="published">Published (Visible on Marketplace)</option>
              <option value="draft">Draft (Saved in Workspace only)</option>
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
                Choose whether students pay for this resource/service or can claim & download it for free.
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
                Free Resource (₹0)
              </button>
            </div>
          </div>

          {/* Price, Currency & Delivery Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-3 border-t border-slate-200/60">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Currency *
              </label>
              <select
                {...register('currency')}
                disabled={isFree}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white cursor-pointer font-medium disabled:bg-slate-100 disabled:text-slate-400"
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
                {isFree ? 'Price (Free)' : 'Price Amount *'}
              </label>
              <input
                type="number"
                min="0"
                max="5000000"
                disabled={isFree}
                {...register('price')}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-emerald-50 disabled:text-emerald-800 disabled:font-bold disabled:border-emerald-200"
              />
              {errors.price && (
                <p className="text-xs text-rose-500 mt-1">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Delivery Timeline (Days) *
              </label>
              <input
                type="number"
                min="1"
                max="90"
                {...register('deliveryTime')}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {errors.deliveryTime && (
                <p className="text-xs text-rose-500 mt-1">{errors.deliveryTime.message}</p>
              )}
            </div>
          </div>

          {isFree && (
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <span className="font-bold">✓ Free Community Listing:</span>
              <span>Classmates will be able to claim this resource and download attached files immediately with $0.00 charge.</span>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Service Description *
          </label>
          <textarea
            rows="6"
            {...register('description')}
            placeholder="Explain what is included in your service, your university major or experience, deliverables, tools used, and steps to get started..."
            className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          {errors.description && (
            <p className="text-xs text-rose-500 mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Portfolio File Upload */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Upload Portfolio Assets / Sample Media (Images or PDF)
          </label>
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-indigo-400 transition-colors bg-slate-50">
            <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-600 mb-1">
              Upload sample work (PNG, JPG, WebP, PDF up to 5MB)
            </p>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
            {uploading && (
              <div className="mt-3 max-w-xs mx-auto">
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Uploading {uploadProgress}%</span>
              </div>
            )}
          </div>

          {/* Attached Files Preview */}
          {portfolioAssets.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {portfolioAssets.map((asset, idx) => (
                <div
                  key={idx}
                  className="relative rounded-xl border border-slate-200 overflow-hidden bg-white p-2 text-center text-xs"
                >
                  {!(asset.fileType === 'pdf' || asset.url?.includes('application/pdf') || asset.name?.toLowerCase().endsWith('.pdf') || asset.url?.toLowerCase().endsWith('.pdf')) ? (
                    <img
                      src={asset.url}
                      alt={asset.name}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      className="w-full h-20 object-cover rounded-lg mb-1"
                    />
                  ) : (
                    <div className="w-full h-20 bg-rose-50 rounded-lg flex flex-col items-center justify-center text-rose-500 mb-1 border border-rose-100">
                      <FileCheck className="w-6 h-6 mb-1 text-rose-600" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-rose-700">PDF Doc</span>
                    </div>
                  )}
                  <p className="truncate text-[11px] text-slate-600">{asset.name || 'Sample File'}</p>
                  <button
                    type="button"
                    onClick={() => handleRemoveAsset(idx)}
                    className="absolute top-1 right-1 p-1 bg-white/90 rounded-full text-rose-500 hover:bg-rose-50"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags / Skills Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Skills & Search Tags (Up to 8 tags)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="e.g. calculus, python, figma, proofreading"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl"
            >
              Add Tag
            </button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-lg font-medium"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx)}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Portfolio URL & Revision Policy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              External Portfolio Link (Optional)
            </label>
            <input
              type="url"
              {...register('portfolioUrl')}
              placeholder="https://github.com/you or https://dribbble.com/you"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {errors.portfolioUrl && (
              <p className="text-xs text-rose-500 mt-1">{errors.portfolioUrl.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Revision Policy
            </label>
            <input
              type="text"
              {...register('revisionPolicy')}
              placeholder="e.g. 1 free revision included"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
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
            <span>{submitting ? 'Publishing...' : 'Publish Service'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
