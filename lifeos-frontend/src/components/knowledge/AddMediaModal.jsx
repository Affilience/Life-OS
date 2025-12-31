/**
 * AddMediaModal Component - Add Video, Podcast, Article, or Course
 * Modal form for quickly capturing media content
 * Auto-fetches thumbnails for YouTube and Vimeo videos
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useKnowledgeStore } from '../../stores/knowledgeStore';

// Extract video ID from YouTube URL
function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\s?#]+)/,
    /youtube\.com\/shorts\/([^&\s?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Extract video ID from Vimeo URL
function extractVimeoId(url) {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

// Get YouTube thumbnail URL (no API needed)
function getYouTubeThumbnail(videoId) {
  // Return high quality thumbnail, with fallback options
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

// Fetch Vimeo thumbnail via oEmbed
async function fetchVimeoThumbnail(videoId) {
  try {
    const response = await fetch(
      `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.thumbnail_url || null;
  } catch (error) {
    console.error('Error fetching Vimeo thumbnail:', error);
    return null;
  }
}

// Detect platform and get thumbnail
async function getThumbnailFromUrl(url) {
  if (!url) return null;

  // YouTube
  const youtubeId = extractYouTubeId(url);
  if (youtubeId) {
    return {
      platform: 'youtube',
      thumbnail: getYouTubeThumbnail(youtubeId),
      videoId: youtubeId,
    };
  }

  // Vimeo
  const vimeoId = extractVimeoId(url);
  if (vimeoId) {
    const thumbnail = await fetchVimeoThumbnail(vimeoId);
    if (thumbnail) {
      return {
        platform: 'vimeo',
        thumbnail,
        videoId: vimeoId,
      };
    }
  }

  return null;
}

export default function AddMediaModal({ isOpen, onClose }) {
  const { addMedia, setActiveView } = useKnowledgeStore();
  const [formData, setFormData] = useState({
    type: 'video',
    title: '',
    creator: '',
    url: '',
    duration: '',
    thumbnailUrl: '',
    status: 'want-to-watch',
  });
  const [errors, setErrors] = useState({});
  const [isFetchingThumbnail, setIsFetchingThumbnail] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [detectedPlatform, setDetectedPlatform] = useState(null);
  const lastFetchedUrl = useRef('');

  // Auto-fetch thumbnail when URL changes (for video type)
  useEffect(() => {
    if (!isOpen) return;
    if (formData.type !== 'video') return;
    if (formData.thumbnailUrl) return; // Don't override manual URL
    if (formData.url === lastFetchedUrl.current) return;
    if (!formData.url || formData.url.length < 10) {
      setThumbnailPreview(null);
      setDetectedPlatform(null);
      return;
    }

    // Validate URL before fetching
    try {
      new URL(formData.url);
    } catch {
      return;
    }

    lastFetchedUrl.current = formData.url;
    setIsFetchingThumbnail(true);

    getThumbnailFromUrl(formData.url)
      .then((result) => {
        if (result) {
          setThumbnailPreview(result.thumbnail);
          setDetectedPlatform(result.platform);
          // Auto-fill the thumbnail URL
          setFormData((prev) => ({
            ...prev,
            thumbnailUrl: result.thumbnail,
          }));
        } else {
          setThumbnailPreview(null);
          setDetectedPlatform(null);
        }
      })
      .finally(() => {
        setIsFetchingThumbnail(false);
      });
  }, [formData.url, formData.type, formData.thumbnailUrl, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.creator.trim()) {
      newErrors.creator = 'Creator/Author is required';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URL is required';
    } else if (!isValidUrl(formData.url)) {
      newErrors.url = 'Please enter a valid URL';
    }

    if (!formData.duration.trim()) {
      newErrors.duration = 'Duration is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const mediaId = addMedia({
      type: formData.type,
      title: formData.title.trim(),
      creator: formData.creator.trim(),
      url: formData.url.trim(),
      duration: formData.duration.trim(),
      thumbnailUrl: formData.thumbnailUrl.trim() || null,
      status: formData.status,
      notes: '',
    });

    // Navigate to the newly created media item
    setActiveView('media-detail', mediaId);

    // Reset form and close modal
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      type: 'video',
      title: '',
      creator: '',
      url: '',
      duration: '',
      thumbnailUrl: '',
      status: 'want-to-watch',
    });
    setErrors({});
    setThumbnailPreview(null);
    setDetectedPlatform(null);
    lastFetchedUrl.current = '';
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const mediaTypes = [
    { id: 'video', label: 'Video', icon: '🎥' },
    { id: 'podcast', label: 'Podcast', icon: '🎙️' },
    { id: 'article', label: 'Article', icon: '📄' },
    { id: 'course', label: 'Course', icon: '📚' },
  ];

  const statusOptions = [
    { id: 'want-to-watch', label: 'Watch Later', icon: '📋' },
    { id: 'in-progress', label: 'Watching', icon: '▶️' },
    { id: 'completed', label: 'Watched', icon: '✓' },
  ];

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-2xl max-h-[85vh] sm:max-h-[90vh] bg-[#12101a]/95 backdrop-blur-md border border-white/10/50 rounded-t-xl sm:rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10/50 bg-[#12101a]/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Add Media</h2>
            <button
              onClick={handleCancel}
              className="p-2 text-white/60 hover:text-white hover:bg-[#1a1724] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6 overflow-y-auto flex-1 min-h-0">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">Type</label>
            <div className="grid grid-cols-4 gap-2">
              {mediaTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleChange('type', type.id)}
                  className={`
                    p-3 rounded-lg border-2 transition-all duration-150
                    ${
                      formData.type === type.id
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                        : 'bg-[#1a1724]/30 border-white/15/50 text-white/60 hover:border-zinc-600 hover:text-zinc-200'
                    }
                  `}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-xs font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">Status</label>
            <div className="grid grid-cols-3 gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status.id}
                  type="button"
                  onClick={() => handleChange('status', status.id)}
                  className={`
                    p-3 rounded-lg border-2 transition-all duration-150
                    ${
                      formData.status === status.id
                        ? status.id === 'completed'
                          ? 'bg-green-500/20 border-green-500/50 text-green-300'
                          : status.id === 'in-progress'
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                          : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
                        : 'bg-[#1a1724]/30 border-white/15/50 text-white/60 hover:border-zinc-600 hover:text-zinc-200'
                    }
                  `}
                >
                  <div className="text-xl mb-1">{status.icon}</div>
                  <div className="text-xs font-medium">{status.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter title"
              className={`
                w-full px-4 py-3 bg-[#1a1724]/30 border rounded-lg text-white placeholder-zinc-600
                focus:outline-none focus:border-cyan-500/50 transition-colors
                ${errors.title ? 'border-red-500/50' : 'border-white/15/50'}
              `}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Creator/Author */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              {formData.type === 'article' ? 'Author' : 'Creator'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.creator}
              onChange={(e) => handleChange('creator', e.target.value)}
              placeholder={formData.type === 'article' ? 'Enter author name' : 'Enter creator/channel name'}
              className={`
                w-full px-4 py-3 bg-[#1a1724]/30 border rounded-lg text-white placeholder-zinc-600
                focus:outline-none focus:border-cyan-500/50 transition-colors
                ${errors.creator ? 'border-red-500/50' : 'border-white/15/50'}
              `}
            />
            {errors.creator && (
              <p className="mt-1 text-sm text-red-500">{errors.creator}</p>
            )}
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => handleChange('url', e.target.value)}
              placeholder="https://..."
              className={`
                w-full px-4 py-3 bg-[#1a1724]/30 border rounded-lg text-white placeholder-zinc-600
                focus:outline-none focus:border-cyan-500/50 transition-colors
                ${errors.url ? 'border-red-500/50' : 'border-white/15/50'}
              `}
            />
            {errors.url && (
              <p className="mt-1 text-sm text-red-500">{errors.url}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Duration <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => handleChange('duration', e.target.value)}
              placeholder={formData.type === 'article' ? '5 min read' : '45:30'}
              className={`
                w-full px-4 py-3 bg-[#1a1724]/30 border rounded-lg text-white placeholder-zinc-600
                focus:outline-none focus:border-cyan-500/50 transition-colors
                ${errors.duration ? 'border-red-500/50' : 'border-white/15/50'}
              `}
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-red-500">{errors.duration}</p>
            )}
            <p className="mt-1 text-xs text-zinc-600">
              {formData.type === 'article'
                ? 'e.g., "5 min read" or "10 minutes"'
                : 'Format: MM:SS or HH:MM:SS (e.g., 45:30 or 1:23:45)'}
            </p>
          </div>

          {/* Thumbnail Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-zinc-300">
                Thumbnail
              </label>
              {isFetchingThumbnail && (
                <span className="flex items-center gap-2 text-xs text-cyan-400">
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Fetching...
                </span>
              )}
            </div>

            <div className="flex gap-4">
              {/* Thumbnail Preview */}
              <div className="flex-shrink-0">
                <div className="w-32 h-20 bg-[#1a1724]/50 border border-white/15/50 rounded-lg overflow-hidden flex items-center justify-center">
                  {formData.thumbnailUrl || thumbnailPreview ? (
                    <img
                      src={formData.thumbnailUrl || thumbnailPreview}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : (
                    <div className="text-center text-zinc-600">
                      <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs">No image</span>
                    </div>
                  )}
                  <div className="hidden w-full h-full items-center justify-center text-zinc-600">
                    <span className="text-xs">Failed</span>
                  </div>
                </div>
              </div>

              {/* URL Input and Info */}
              <div className="flex-1 space-y-2">
                <input
                  type="url"
                  value={formData.thumbnailUrl}
                  onChange={(e) => {
                    handleChange('thumbnailUrl', e.target.value);
                    if (e.target.value) {
                      setThumbnailPreview(null);
                    }
                  }}
                  placeholder={formData.type === 'video' ? 'Auto-detected from YouTube/Vimeo' : 'https://...'}
                  className="w-full px-4 py-3 bg-[#1a1724]/30 border border-white/15/50 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
                <p className="text-xs text-white/50">
                  {detectedPlatform ? (
                    <span className="text-green-400">
                      ✓ Thumbnail auto-detected from {detectedPlatform === 'youtube' ? 'YouTube' : 'Vimeo'}
                    </span>
                  ) : formData.thumbnailUrl ? (
                    <span>Using custom thumbnail URL</span>
                  ) : formData.type === 'video' ? (
                    <span>Paste a YouTube or Vimeo URL above to auto-fetch thumbnail</span>
                  ) : (
                    <span>Link to an image that represents this content</span>
                  )}
                </p>
                {formData.thumbnailUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, thumbnailUrl: '' }));
                      setThumbnailPreview(null);
                      setDetectedPlatform(null);
                      lastFetchedUrl.current = ''; // Allow re-fetch
                    }}
                    className="text-xs text-white/50 hover:text-zinc-300 underline"
                  >
                    Clear thumbnail
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] border-t border-white/10/50 bg-[#12101a]/50 flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-zinc-600">
            <span className="text-red-500">*</span> Required fields
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-white/60 hover:text-white hover:bg-[#1a1724] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-purple-500 hover:bg-purple-600 hover:shadow-[0_8px_32px_rgba(139,92,246,0.3)] hover:-translate-y-[1px] active:translate-y-0 text-white font-medium rounded-lg transition-all duration-150"
            >
              Add Media
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
