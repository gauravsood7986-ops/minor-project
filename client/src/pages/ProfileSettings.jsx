import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSelector, useDispatch } from 'react-redux';
import { UploadCloud, X, ArrowRight, User } from 'lucide-react';
import { profilesApi } from '../api/profiles.api.js';
import { uploadsApi } from '../api/uploads.api.js';
import { updateCurrentUser } from '../features/auth/authSlice.js';
import { getInitials } from '../utils/formatters.js';
import toast from 'react-hot-toast';

const profileSettingsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  college: z.string().max(150).optional(),
  bio: z.string().max(1000).optional(),
  website: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  github: z.string().optional(),
  linkedin: z.string().optional(),
});

export const ProfileSettings = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);

  // Avatar upload state
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar?.url || '');
  const [avatarPublicId, setAvatarPublicId] = useState(user?.avatar?.public_id || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Skills & Languages tags
  const [skills, setSkills] = useState(user?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [languages, setLanguages] = useState(user?.languages || ['English']);
  const [langInput, setLangInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      name: user?.name || '',
      college: user?.college || '',
      bio: user?.bio || '',
      website: user?.socialLinks?.website || '',
      github: user?.socialLinks?.github || '',
      linkedin: user?.socialLinks?.linkedin || '',
    },
  });

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const res = await uploadsApi.uploadFile(file);
      if (res.data?.upload) {
        setAvatarUrl(res.data.upload.url);
        setAvatarPublicId(res.data.upload.public_id);
        toast.success('Avatar uploaded. Remember to save changes.');
      }
    } catch (err) {
      toast.error(err.message || 'Avatar upload failed');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const clean = skillInput.trim();
    if (clean && !skills.includes(clean)) {
      setSkills([...skills, clean]);
      setSkillInput('');
    }
  };

  const handleAddLang = (e) => {
    e.preventDefault();
    const clean = langInput.trim();
    if (clean && !languages.includes(clean)) {
      setLanguages([...languages, clean]);
      setLangInput('');
    }
  };

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      const payload = {
        name: values.name,
        college: values.college,
        bio: values.bio,
        skills,
        languages,
        avatar: {
          url: avatarUrl,
          public_id: avatarPublicId,
        },
        socialLinks: {
          website: values.website,
          github: values.github,
          linkedin: values.linkedin,
        },
      };

      const res = await profilesApi.updateMyProfile(payload);
      dispatch(updateCurrentUser(res.data.user));
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Profile Settings
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
          Customize your public freelancer bio, academic university, skills, and links.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 sm:p-10 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Avatar Section */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            Profile Photo
          </label>
          <div className="flex items-center gap-5">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-indigo-100 shadow-xs"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-xs">
                {getInitials(user?.name)}
              </div>
            )}

            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
                className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                JPG, PNG or WebP. Max size: 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* Name & College */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              {...register('name')}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              College or University
            </label>
            <input
              type="text"
              {...register('college')}
              placeholder="e.g. University of California, Berkeley"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Freelancer Biography
          </label>
          <textarea
            rows="4"
            {...register('bio')}
            placeholder="Tell clients about your background, degree program, academic tutoring experience, or freelance expertise..."
            className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Skills */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Skills & Competencies
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="e.g. Python, React, Video Editing, Statistics"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl"
            >
              Add
            </button>
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-lg font-medium"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Languages */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Languages Spoken
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="e.g. English, Spanish, French"
              value={langInput}
              onChange={(e) => setLangInput(e.target.value)}
              className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddLang}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl"
            >
              Add
            </button>
          </div>
          {languages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {languages.map((lang, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-lg font-medium"
                >
                  <span>{lang}</span>
                  <button
                    type="button"
                    onClick={() => setLanguages(languages.filter((_, i) => i !== idx))}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Social / Portfolio Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Personal Website
            </label>
            <input
              type="url"
              {...register('website')}
              placeholder="https://yourportfolio.me"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              GitHub Profile
            </label>
            <input
              type="text"
              {...register('github')}
              placeholder="https://github.com/..."
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              LinkedIn Profile
            </label>
            <input
              type="text"
              {...register('linkedin')}
              placeholder="https://linkedin.com/in/..."
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-7 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors shadow-xs flex items-center gap-2"
          >
            <span>{submitting ? 'Saving...' : 'Save Profile Changes'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
