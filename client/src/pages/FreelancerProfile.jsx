import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  GraduationCap,
  Globe,
  Github,
  Linkedin,
  Star,
  PackageOpen,
  Briefcase,
  Languages,
  Tag,
  Calendar,
} from 'lucide-react';
import { profilesApi } from '../api/profiles.api.js';
import { ServiceCard } from '../components/common/ServiceCard.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { formatDate, getInitials } from '../utils/formatters.js';

export const FreelancerProfile = () => {
  const { username } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('services'); // 'services' or 'reviews'

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await profilesApi.getProfile(username);
        setProfileData(res.data?.profile);
        setServices(res.data?.services || []);
        setReviews(res.data?.reviews || []);
      } catch (err) {
        console.error('Failed to load freelancer profile:', err);
        setError(err.message || 'Freelancer profile not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <LoadingSpinner text="Retrieving freelancer profile..." />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Profile Not Found</h2>
        <p className="text-slate-600 mb-6">{error || 'This student freelancer profile does not exist.'}</p>
        <Link
          to="/services"
          className="inline-flex px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"
        >
          Browse Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Freelancer Bio & Info Card */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs text-center">
            {/* Avatar */}
            {profileData.avatar?.url ? (
              <img
                src={profileData.avatar.url}
                alt={profileData.name}
                className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-2 border-indigo-100 shadow-xs"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                {getInitials(profileData.name)}
              </div>
            )}

            <h1 className="text-xl font-bold text-slate-900 mb-0.5">{profileData.name}</h1>
            <p className="text-xs text-slate-500 mb-2">@{profileData.username}</p>

            {profileData.college && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold mb-4">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{profileData.college}</span>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 text-center text-xs mb-4">
              <div className="p-2 rounded-xl bg-slate-50">
                <span className="block text-lg font-bold text-slate-900">
                  {profileData.stats?.publishedServicesCount || services.length}
                </span>
                <span className="text-slate-500 text-[11px]">Services</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50">
                <span className="block text-lg font-bold text-slate-900 flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400 inline" />
                  {profileData.stats?.averageRating ? `${profileData.stats.averageRating}` : 'N/A'}
                </span>
                <span className="text-slate-500 text-[11px]">
                  ({profileData.stats?.reviewCount || 0} reviews)
                </span>
              </div>
            </div>

            {/* Bio */}
            {profileData.bio && (
              <p className="text-xs text-slate-600 text-left leading-relaxed pt-2 border-t border-slate-100">
                {profileData.bio}
              </p>
            )}

            {/* Member Since */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-4 mt-4 border-t border-slate-100">
              <Calendar className="w-3.5 h-3.5" />
              <span>Joined {formatDate(profileData.createdAt)}</span>
            </div>
          </div>

          {/* Skills & Languages */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            {profileData.skills && profileData.skills.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Skills & Tools
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {profileData.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profileData.languages && profileData.languages.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Languages
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {profileData.languages.map((lang, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Social / External Links */}
            {profileData.socialLinks && Object.values(profileData.socialLinks).some(Boolean) && (
              <div className="pt-3 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Profiles & Links
                </h3>
                <div className="space-y-1.5 text-xs">
                  {profileData.socialLinks.website && (
                    <a
                      href={profileData.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 truncate"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span className="truncate">{profileData.socialLinks.website}</span>
                    </a>
                  )}
                  {profileData.socialLinks.github && (
                    <a
                      href={profileData.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-slate-700 hover:text-indigo-600 truncate"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span className="truncate">{profileData.socialLinks.github}</span>
                    </a>
                  )}
                  {profileData.socialLinks.linkedin && (
                    <a
                      href={profileData.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 truncate"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                      <span className="truncate">{profileData.socialLinks.linkedin}</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Right Column: Services & Reviews Tabs */}
        <main className="lg:col-span-2 space-y-6">
          {/* Tab Selector */}
          <div className="flex border-b border-slate-200 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('services')}
              className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'services'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Published Services ({services.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'reviews'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>Client Reviews ({reviews.length})</span>
            </button>
          </div>

          {activeTab === 'services' ? (
            services.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {services.map((service) => (
                  <ServiceCard key={service._id} service={service} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={PackageOpen}
                title="No published services"
                description={`@${profileData.username} has not published any active freelance services on CampusGig yet.`}
              />
            )
          ) : (
            reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
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
                          {rev.reviewer?.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </div>
                    {rev.service?.title && (
                      <p className="text-[11px] text-slate-400">
                        Service: <span className="text-slate-600 font-medium">{rev.service.title}</span>
                      </p>
                    )}
                    <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-slate-400 block pt-1">
                      {formatDate(rev.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Star}
                title="No reviews yet"
                description={`@${profileData.username} hasn't received reviews from completed client engagements yet.`}
              />
            )
          )}
        </main>
      </div>
    </div>
  );
};
