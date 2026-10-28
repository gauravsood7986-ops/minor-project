import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ShieldCheck, User, FileText } from 'lucide-react';
import { formatCurrency, getInitials } from '../../utils/formatters.js';
import { getCategoryLabel } from '../../utils/categories.js';

export const ServiceCard = ({ service }) => {
  if (!service) return null;

  const {
    _id,
    title,
    category,
    price,
    currency = 'USD',
    deliveryTime,
    owner,
    portfolioAssets = [],
  } = service;

  const firstAsset = portfolioAssets.length > 0 ? portfolioAssets[0] : null;
  const isPdf = Boolean(
    firstAsset &&
      (firstAsset.fileType === 'pdf' ||
        firstAsset.url?.includes('application/pdf') ||
        firstAsset.url?.toLowerCase().endsWith('.pdf') ||
        firstAsset.name?.toLowerCase().endsWith('.pdf'))
  );

  const primaryImage = firstAsset && !isPdf ? firstAsset.url : null;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden hover:-translate-y-0.5">
      {/* Thumbnail / Header */}
      <Link to={`/services/${_id}`} className="block relative aspect-[16/10] bg-slate-100 overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={title}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : isPdf ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-slate-100 text-rose-600 p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-white text-rose-600 flex items-center justify-center shadow-xs mb-2">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100/80 px-2.5 py-0.5 rounded-full mb-1">
              PDF Document
            </span>
            <p className="text-xs text-slate-600 font-medium line-clamp-1 px-2">
              {firstAsset.name || title}
            </p>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 text-indigo-500 p-4 text-center">
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-600 bg-white/80 px-2.5 py-1 rounded-full shadow-xs mb-2">
              {getCategoryLabel(category)}
            </span>
            <p className="text-xs text-slate-500 font-medium line-clamp-2 px-2">
              {title}
            </p>
          </div>
        )}

        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-xs text-slate-800 shadow-xs border border-slate-200/50">
            {getCategoryLabel(category)}
          </span>
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Owner Info */}
          {owner && (
            <Link
              to={`/profiles/${owner.username}`}
              className="flex items-center gap-2.5 mb-3 group/author"
            >
              {owner.avatar?.url ? (
                <img
                  src={owner.avatar.url}
                  alt={owner.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                  {getInitials(owner.name)}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate group-hover/author:text-indigo-600 transition-colors">
                  {owner.name}
                </p>
                {owner.college && (
                  <p className="text-[11px] text-slate-500 truncate">{owner.college}</p>
                )}
              </div>
            </Link>
          )}

          {/* Title */}
          <Link to={`/services/${_id}`} className="block">
            <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 text-sm leading-snug mb-3">
              {title}
            </h4>
          </Link>
        </div>

        {/* Footer Meta */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{deliveryTime} {deliveryTime === 1 ? 'day' : 'days'}</span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 block font-normal">Starting at</span>
            <span className="text-base font-bold text-slate-900">
              {formatCurrency(price, currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
