import React, { useState, useEffect } from 'react';
import { X, Lightbulb, Tag, Star, Target } from 'lucide-react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import './AddIdeaModal.css';

const initialFormData = {
  title: '',
  description: '',
  category: 'Technology',
  priority: 'medium',
  tags: '',
  rating: 0,
  notes: '',
  nextActions: '',
  stage: 'seed'
};

const AddIdeaModal = ({ isOpen, onClose, onSubmit, editIdea }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (editIdea) {
      setFormData({
        title: editIdea.title || '',
        description: editIdea.description || '',
        category: editIdea.category || 'Technology',
        priority: editIdea.priority || 'medium',
        tags: (editIdea.tags || []).join(', '),
        rating: editIdea.rating || 0,
        notes: editIdea.notes || '',
        nextActions: (editIdea.nextActions || []).join('\n'),
        stage: editIdea.stage || 'seed'
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editIdea]);

  const categories = [
    'Technology',
    'Business',
    'Education',
    'Health',
    'Social Impact',
    'Science',
    'Art & Creative',
    'Environment',
    'Finance',
    'Other'
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: '#10b981' },
    { value: 'medium', label: 'Medium', color: '#f59e0b' },
    { value: 'high', label: 'High', color: '#ef4444' }
  ];

  const stages = [
    { value: 'seed', label: 'Seed' },
    { value: 'sprouting', label: 'Sprouting' },
    { value: 'growing', label: 'Growing' },
    { value: 'mature', label: 'Mature' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
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

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const ideaData = {
      ...formData,
      tags: formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0),
      nextActions: formData.nextActions
        .split('\n')
        .map(action => action.trim())
        .filter(action => action.length > 0),
      stage: editIdea ? formData.stage : 'seed',
      dateCreated: editIdea ? editIdea.dateCreated : new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    onSubmit(ideaData);
    handleClose();
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setErrors({});
    onClose();
  };

  const isEditing = !!editIdea;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isEditing ? "Edit Idea" : "Plant New Idea"}>
      <form onSubmit={handleSubmit} className="add-idea-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="title">
              <Lightbulb size={16} />
              Idea Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter your brilliant idea..."
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority">
              <Target size={16} />
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
            >
              {priorities.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>

          {isEditing && (
            <div className="form-group">
              <label htmlFor="stage">
                Growth Stage
              </label>
              <select
                id="stage"
                name="stage"
                value={formData.stage}
                onChange={handleInputChange}
              >
                {stages.map(stage => (
                  <option key={stage.value} value={stage.value}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your idea in detail..."
              rows={4}
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              <Star size={16} />
              Initial Rating
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
          </div>
        </div>

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
              Add relevant tags to help organize and find your idea later
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="notes">
              Initial Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any initial thoughts, research, or considerations..."
              rows={3}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nextActions">
              Next Actions
            </label>
            <textarea
              id="nextActions"
              name="nextActions"
              value={formData.nextActions}
              onChange={handleInputChange}
              placeholder="List potential next steps (one per line)..."
              rows={3}
            />
            <div className="help-text">
              Enter each action on a new line. These will help you move the idea forward.
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {isEditing ? 'Save Changes' : 'Plant Idea'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddIdeaModal;