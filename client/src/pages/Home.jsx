import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  GraduationCap,
  Users,
  CheckCircle2,
  PackageOpen,
  BookOpen,
  DollarSign,
  FileText,
  Clock,
} from 'lucide-react';
import { servicesApi } from '../api/services.api.js';
import { ServiceCard } from '../components/common/ServiceCard.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { CATEGORIES } from '../utils/categories.js';

export const Home = () => {
  const [recentServices, setRecentServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentServices = async () => {
      try {
        setLoading(true);
        const res = await servicesApi.getServices({ limit: 4, sort: 'newest' });
        setRecentServices(res.data?.services || []);
      } catch (err) {
        console.error('Failed to fetch marketplace services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentServices();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append('search', searchTerm.trim());
    if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
    navigate(`/services?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 gradient-hero border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-xs font-semibold text-indigo-700 mb-6 shadow-2xs">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Student Marketplace — Buy & Sell Resources, Notes & Freelance Work</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight md:leading-none mb-6">
            Buy Study Resources &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              Hire Student Talent
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
            Find lecture notes, exam study guides, homework tutoring, and freelance services created by university students. Or sell your own notes and skills to earn money.
          </p>

          {/* Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-3xl mx-auto bg-white p-2.5 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 flex flex-col sm:flex-row gap-2 mb-6"
          >
            <div className="flex-1 flex items-center px-3.5 py-2">
              <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Try 'Python notes', 'Calculus tutor', or 'Logo design'..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <div className="sm:w-56 border-t sm:border-t-0 sm:border-l border-slate-200 px-3 py-2 flex items-center">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-sm text-slate-700 bg-transparent focus:outline-none cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition duration-150 shadow-sm flex items-center justify-center gap-2"
            >
              <span>Search Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <Link
              to="/services"
              className="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl transition-colors border border-indigo-100 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Browse All Resources to Buy</span>
            </Link>
            <Link
              to="/services/publish"
              className="px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-xl transition-colors border border-emerald-200 flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Sell Your Notes / Services</span>
            </Link>
            <Link
              to="/how-it-works"
              className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors border border-slate-200"
            >
              How It Works Guide
            </Link>
          </div>

          {/* Trust Points */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Student Accounts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span>Direct Student Inquiries</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-rose-500" />
              <span>PDF & Image Document Previews</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-600" />
              <span>Free to Join & Explore</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills Bar */}
      <section className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Popular Categories
            </span>
            <Link to="/services" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              View All ({CATEGORIES.length})
            </Link>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/services?category=${cat.id}`}
                className="shrink-0 px-4 py-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/80 rounded-xl font-medium text-slate-700 transition-colors"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 2-Column: Simple Buying & Selling Cards */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Buy Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border border-blue-100 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-5 shadow-sm">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 mb-2">
                  Looking to Buy?
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                  Get Study Notes, Tutoring & Project Help
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Browse verified materials uploaded by top university students. Preview sample pages, read genuine peer reviews, and connect directly with sellers.
                </p>
                <ul className="space-y-2 text-xs text-slate-700 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Download class lecture summaries & exam study guides</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Hire classmates for tutoring in coding, math & languages</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Direct chat without middlemen or hidden fees</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/services"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
              >
                <span>Find Resources to Buy</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Sell Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border border-emerald-100 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-5 shadow-sm">
                  <DollarSign className="w-6 h-6" />
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 mb-2">
                  Looking to Sell?
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                  Monetize Your Lecture Notes & Freelance Skills
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Turn your hard work into extra income. Upload your PDF notes or list your coding, design, or writing services in minutes.
                </p>
                <ul className="space-y-2 text-xs text-slate-700 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Set your own price in dollars with instant publishing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Manage all buyer messages right in your private Dashboard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Build your verified student profile & 5-star reputation</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/services/publish"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
              >
                <span>List a Resource / Service to Sell</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Marketplace Services Preview (Real MongoDB records) */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-600">
                Live Marketplace
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Recently Published by Students
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Explore real resources and services listed by verified university peers.
              </p>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 mt-3 md:mt-0"
            >
              <span>Explore All Resources</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12">
              <LoadingSpinner text="Retrieving live marketplace offerings..." />
            </div>
          ) : recentServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentServices.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={PackageOpen}
              title="No services published yet"
              description="Be the first student to publish a service or resource listing in the marketplace."
              actionLabel="Offer a Service Now"
              actionLink="/services/publish"
            />
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-600">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              How CampusGig Works
            </h2>
            <p className="text-slate-600 text-sm mt-3">
              Built for university life: easy to understand, transparent, and direct peer-to-peer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center mb-6 shadow-sm">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Create an Account</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Sign up with your university or personal email in 30 seconds. Every account can both buy study materials and sell resources.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center mb-6 shadow-sm">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Browse or Publish</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Search study notes, tutor listings, and coding gigs with PDF/image previews. Or upload your own files, set a price, and publish.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center mb-6 shadow-sm">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Connect & Collaborate</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Send inquiries directly from listing pages. Track all inquiries sent and received inside your clean, personal Dashboard.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700"
            >
              <span>Read the Full Student Buyer & Seller Guide</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Student Call-to-Action */}
      <section className="py-16 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <GraduationCap className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">
            Ready to Buy or Sell on Campus?
          </h2>
          <p className="text-indigo-200 text-sm md:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Join your university peers on CampusGig. Get help with difficult classes or earn money from your knowledge.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-7 py-3.5 bg-white text-indigo-900 font-bold text-sm rounded-xl hover:bg-indigo-50 shadow-md transition-colors"
            >
              Create Free Account
            </Link>
            <Link
              to="/services"
              className="w-full sm:w-auto px-7 py-3.5 bg-indigo-700/60 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl border border-indigo-500/50 transition-colors"
            >
              Explore Marketplace
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
