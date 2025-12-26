import React, { useState } from 'react';
import { X, Book, Headphones, FileText, Video, GraduationCap, Star, Tag } from 'lucide-react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import './AddLearningModal.css';

const AddLearningModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: 'book',
    title: '',
    author: '',
    show: '',
    tags: '',
    rating: 0,
    keyInsights: '',
    status: 'in-progress',
    progress: 0,
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const contentTypes = [
    { value: 'book', label: 'Book', icon: Book },
    { value: 'podcast', label: 'Podcast', icon: Headphones },
    { value: 'article', label: 'Article', icon: FileText },
    { value: 'video', label: 'Video', icon: Video },
    { value: 'course', label: 'Course', icon: GraduationCap }
  ];

  const statuses = [
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    let processedValue = value;
    if (type === 'number') {
      processedValue = Math.max(0, Math.min(100, parseInt(value) || 0));
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setFormData(prev => ({
      ...prev,
      type: newType,
      // Clear type-specific fields when changing type
      author: newType === 'book' || newType === 'article' ? prev.author : '',
      show: newType === 'podcast' || newType === 'video' ? prev.show : ''
    }));
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if ((formData.type === 'book' || formData.type === 'article') && !formData.author.trim()) {
      newErrors.author = 'Author is required for books and articles';
    }

    if ((formData.type === 'podcast' || formData.type === 'video') && !formData.show.trim()) {
      newErrors.show = 'Show/Channel is required for podcasts and videos';
    }

    if (formData.status === 'completed' && formData.rating === 0) {
      newErrors.rating = 'Rating is required for completed content';
    }

    if (formData.status === 'completed' && !formData.keyInsights.trim()) {
      newErrors.keyInsights = 'Key insights are required for completed content';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const learningData = {
      ...formData,
      tags: formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0),
      keyInsights: formData.keyInsights
        .split('\n')
        .map(insight => insight.trim())
        .filter(insight => insight.length > 0),
      progress: formData.status === 'completed' ? 100 : formData.progress,
      dateStarted: new Date().toISOString(),
      dateCompleted: formData.status === 'completed' ? new Date().toISOString() : null
    };

    onSubmit(learningData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      type: 'book',
      title: '',
      author: '',
      show: '',
      tags: '',
      rating: 0,
      keyInsights: '',
      status: 'in-progress',
      progress: 0,
      notes: ''
    });
    setErrors({});
    onClose();
  };

  const getTypeIcon = (type) => {
    const typeConfig = contentTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : Book;
  };

  const TypeIcon = getTypeIcon(formData.type);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Learning Content">
      <form onSubmit={handleSubmit} className="add-learning-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">
              <TypeIcon size={16} />
              Content Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleTypeChange}
            >
              {contentTypes.map(type => {
                const Icon = type.icon;
                return (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="title">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder={`Enter ${formData.type} title...`}
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>
        </div>

        <div className="form-row">
          {(formData.type === 'book' || formData.type === 'article') && (
            <div className="form-group">
              <label htmlFor="author">
                Author
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                placeholder="Enter author name..."
                className={errors.author ? 'error' : ''}
              />
              {errors.author && <span className="error-message">{errors.author}</span>}
            </div>
          )}

          {(formData.type === 'podcast' || formData.type === 'video') && (
            <div className="form-group">
              <label htmlFor="show">
                {formData.type === 'podcast' ? 'Show Name' : 'Channel'}
              </label>
              <input
                type="text"
                id="show"
                name="show"
                value={formData.show}
                onChange={handleInputChange}
                placeholder={`Enter ${formData.type === 'podcast' ? 'show name' : 'channel name'}...`}
                className={errors.show ? 'error' : ''}
              />
              {errors.show && <span className="error-message">{errors.show}</span>}
            </div>
          )}

          {formData.status === 'in-progress' && (
            <div className="form-group">
              <label htmlFor="progress">
                Progress (%)
              </label>
              <input
                type="number"
                id="progress"
                name="progress"
                value={formData.progress}
                onChange={handleInputChange}
                min="0"
                max="100"
                placeholder="0"
              />
            </div>
          )}
        </div>

        {formData.status === 'completed' && (
          <div className="form-row">
            <div className="form-group">
              <label>
                <Star size={16} />
                Rating
              </label>
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    type="button"
                    className={`rating-star ${formData.rating >= rating ? 'active' : ''}`}
                    onClick={() => handleRatingClick(rating)}
                  >
                    <Star size={20} fill={formData.rating >= rating ? 'var(--color-knowledge-500)' : 'none'} />
                  </button>
                ))}
                <span className="rating-text">
                  {formData.rating === 0 ? 'No rating' : `${formData.rating}/5 stars`}
                </span>
              </div>
              {errors.rating && <span className="error-message">{errors.rating}</span>}
            </div>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="tags">
              <Tag size={16} />
              Tags
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="Enter tags separated by commas..."
            />
            <div className="help-text">
              Add relevant tags to categorise this content
            </div>
          </div>
        </div>

        {formData.status === 'completed' && (
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="keyInsights">
                Key Insights
              </label>
              <textarea
                id="keyInsights"
                name="keyInsights"
                value={formData.keyInsights}
                onChange={handleInputChange}
                placeholder="Enter key insights (one per line)..."
                rows={4}
                className={errors.keyInsights ? 'error' : ''}
              />
              <div className="help-text">
                Enter each insight on a new line
              </div>
              {errors.keyInsights && <span className="error-message">{errors.keyInsights}</span>}
            </div>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="notes">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional notes or thoughts..."
              rows={3}
            />
          </div>
        </div>

        <div className="modal-actions">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Add Content
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddLearningModal;