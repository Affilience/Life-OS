import React from 'react';
import { format } from 'date-fns';
import { Pen, Plus } from 'lucide-react';
import './JournalPage.css';

function JournalPage({
  entry,
  pageNumber,
  side = 'right',
  isEmpty = false,
  onStartWriting
}) {
  const formattedDate = entry.date
    ? format(new Date(entry.date), 'EEEE, MMMM d, yyyy')
    : '';

  const handleClick = () => {
    if (isEmpty && onStartWriting) {
      onStartWriting();
    }
  };

  return (
    <div
      className={`journal-page journal-page--${side} ${isEmpty ? 'journal-page--empty' : ''}`}
      data-page={pageNumber}
      onClick={handleClick}
    >
      {/* Page header */}
      <div className="page-header">
        <div className="page-date">
          {formattedDate}
        </div>
        <div className="page-number">{pageNumber}</div>
      </div>

      {/* Page content */}
      <div className="page-content">
        {isEmpty ? (
          <div className="empty-page-prompt">
            <div className="empty-icon">
              <Plus size={48} />
            </div>
            <h3>Start Writing</h3>
            <p>Click to begin a new entry</p>
          </div>
        ) : (
          <>
            {entry.title && (
              <h2 className="entry-title">{entry.title}</h2>
            )}

            <div className="entry-text">
              {entry.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {entry.tags && entry.tags.length > 0 && (
              <div className="entry-tags">
                {entry.tags.map(tag => (
                  <span key={tag} className="tag">#{tag}</span>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Page footer */}
      {!isEmpty && (
        <div className="page-footer">
          {entry.mood && (
            <div className="mood-indicator">
              <span className="mood-emoji">
                {entry.mood >= 8 ? '😊' : entry.mood >= 5 ? '😐' : '😔'}
              </span>
              <span className="mood-value">{entry.mood}/10</span>
            </div>
          )}
          <div className="word-count">
            {entry.wordCount || entry.content?.split(/\s+/).length || 0} words
          </div>
        </div>
      )}

      {/* Pen icon for empty pages */}
      {isEmpty && (
        <div className="page-pen-icon">
          <Pen size={16} opacity={0.3} />
        </div>
      )}
    </div>
  );
}

export default JournalPage;
