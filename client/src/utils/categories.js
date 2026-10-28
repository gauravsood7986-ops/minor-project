export const CATEGORIES = [
  { id: 'all', label: 'All Resources & Services', icon: 'Sparkles' },
  { id: 'study_notes', label: 'Study Notes & Materials', icon: 'BookOpen' },
  { id: 'tutoring', label: 'Academic Tutoring', icon: 'GraduationCap' },
  { id: 'writing', label: 'Content Writing & Proofreading', icon: 'PenTool' },
  { id: 'graphic_design', label: 'Graphic Design & Branding', icon: 'Palette' },
  { id: 'web_development', label: 'Web Development', icon: 'Globe' },
  { id: 'programming', label: 'Programming & Debugging', icon: 'Code' },
  { id: 'video_editing', label: 'Video Editing & Motion', icon: 'Video' },
  { id: 'photography', label: 'Photography', icon: 'Camera' },
  { id: 'digital_marketing', label: 'Social Media & Marketing', icon: 'Megaphone' },
  { id: 'ui_ux_design', label: 'UI/UX Design', icon: 'Layout' },
  { id: 'presentation_design', label: 'Presentation & Pitch Decks', icon: 'Presentation' },
  { id: 'translation', label: 'Translation & Language', icon: 'Languages' },
  { id: 'other', label: 'Other Student Services', icon: 'Briefcase' },
];

export const getCategoryLabel = (id) => {
  const match = CATEGORIES.find((cat) => cat.id === id);
  return match ? match.label : id;
};
