import React, { useState } from 'react';
import { X, FileText, Tag, Folder } from 'lucide-react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import './AddNoteModal.css';

const AddNoteModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'personal',
    tags: '',
    isPinned: false
  });

  const [errors, setErrors] = useState({});

  const categories = [
    { id: 'work', name: 'Work', icon: '💼' },
    { id: 'personal', name: 'Personal', icon: '👤' },
    { id: 'ideas', name: 'Ideas', icon: '💡' },
    { id: 'research', name: 'Research', icon: '🔬' },
    { id: 'meetings', name: 'Meetings', icon: '👥' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (formData.content.trim().length < 10) {
      newErrors.content = 'Content must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const noteData = {
      ...formData,
      tags: formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0),
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      wordCount: formData.content.trim().split(/\s+/).length
    };

    onSubmit(noteData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      content: '',
      category: 'personal',
      tags: '',
      isPinned: false
    });
    setErrors({});
    onClose();
  };

  const getWordCount = () => {
    return formData.content.trim() ? formData.content.trim().split(/\s+/).length : 0;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Note">
      <form onSubmit={handleSubmit} className="add-note-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="title">
              <FileText size={16} />
              Note Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter note title..."
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">
              <Folder size={16} />
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="content">
              Content
              <span className="word-count">{getWordCount()} words</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Write your note content here..."
              rows={10}
              className={errors.content ? 'error' : ''}
            />
            {errors.content && <span className="error-message">{errors.content}</span>}
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
              Add tags separated by commas (e.g., "productivity, ideas, work")
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isPinned"
                checked={formData.isPinned}
                onChange={handleInputChange}
              />
              <span className="checkbox-text">Pin this note to the top</span>
            </label>
          </div>
        </div>

        <div className="modal-actions">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Create Note
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddNoteModal;