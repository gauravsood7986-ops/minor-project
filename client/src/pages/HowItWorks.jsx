import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  DollarSign,
  Search,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  UploadCloud,
  FileCheck,
  Users,
} from 'lucide-react';

export const HowItWorks = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-indigo-50/60 to-white border-b border-slate-200/80 py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Simple, Student-Friendly Marketplace</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
            How CampusGig Works
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            CampusGig connects university students who want to <strong>buy study resources</strong>, 
            get homework help, or hire talent with students who want to <strong>sell notes & freelance skills</strong>.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/services"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Browse Marketplace</span>
            </Link>
            <Link
              to="/services/publish"
              className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-semibold text-sm rounded-xl transition-all shadow-2xs flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Start Selling</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2 Paths: Buyer & Seller */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Path 1: For Buyers */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xs flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="inline-block px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 uppercase tracking-wider mb-2 w-fit">
              For Buyers
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              How to Buy Notes & Hire Freelancers
            </h2>
            <p className="text-slate-600 text-sm mb-6">
              Find exactly what you need to ace your exams or complete your university projects.
            </p>

            <div className="space-y-6 flex-1">
              <div className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Search & Discover</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Search by subject, college course, or skill (e.g. Python, Calculus, Graphic Design).
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Inspect Preview & Ratings</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    View sample pages, PDF documents, portfolio images, and authentic student reviews.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Send Inquiry & Collaborate</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Send a quick message directly to the student seller right from the listing page to get your files or start work.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link
                to="/services"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold text-center block transition-colors"
              >
                Explore Student Listings
              </Link>
            </div>
          </div>

          {/* Path 2: For Sellers */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xs flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="inline-block px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 uppercase tracking-wider mb-2 w-fit">
              For Sellers
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              How to Sell Resources & Earn Money
            </h2>
            <p className="text-slate-600 text-sm mb-6">
              Monetize your class lecture notes, coding abilities, writing, or design skills.
            </p>

            <div className="space-y-6 flex-1">
              <div className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Create Free Account</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Sign up with your university or personal email in seconds and set up your student profile.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Publish Your Listing</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Upload your notes (PDF), portfolio images, choose a category, set your price, and describe what's included.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Manage Orders from Dashboard</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Receive inquiries in your seller dashboard, chat with buyers, fulfill requests, and build 5-star ratings.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link
                to="/services/publish"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold text-center block transition-colors"
              >
                Publish a Resource or Service
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white">
          <div className="max-w-3xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold mb-3">
              Built Specifically for University Students
            </h3>
            <p className="text-slate-200 text-sm leading-relaxed mb-8">
              No complicated corporate forms or confusing fees. CampusGig gives every student a dedicated dashboard,
              public profile, and direct communication with peer classmates.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h5 className="font-bold text-sm">Peer Verified</h5>
                  <p className="text-xs text-slate-300 mt-0.5">Profiles with real college affiliations.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileCheck className="w-6 h-6 text-indigo-400 shrink-0" />
                <div>
                  <h5 className="font-bold text-sm">PDF & Image Previews</h5>
                  <p className="text-xs text-slate-300 mt-0.5">Inspect notes samples before committing.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <h5 className="font-bold text-sm">Direct Student Chat</h5>
                  <p className="text-xs text-slate-300 mt-0.5">Communicate directly with zero middlemen.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Quick Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-slate-900 text-center mb-8">
            Frequently Asked Questions
          </h3>

          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <h4 className="font-semibold text-slate-900 text-sm mb-1">
                Can I both buy and sell with the same account?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Yes! Every account can browse and buy resources from other students, as well as publish their own notes and services to sell.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <h4 className="font-semibold text-slate-900 text-sm mb-1">
                What file types can I upload as study resources?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                You can upload PDF documents, PNG, JPG, and WebP images. Each file gets an automatic preview card for students to view.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <h4 className="font-semibold text-slate-900 text-sm mb-1">
                Where do I view inquiries and manage what I am selling?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Simply click on your profile avatar in the navigation bar to open your <strong>Dashboard</strong>. 
                From there you can see your listed resources, messages from buyers, and edit your profile.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
