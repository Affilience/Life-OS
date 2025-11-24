import React from 'react';
import { Link2, ExternalLink } from 'lucide-react';
import './BacklinksPanel.css';

export default function BacklinksPanel({ currentNote, backlinks, notes, onNoteClick }) {
  // Helper function to show context around link
  const getContextAroundLink = (content, searchTerm) => {
    const regex = new RegExp(`(.{0,50}\\[\\[${searchTerm}\\]\\].{0,50})`, 'i');
    const match = content.match(regex);
    if (match) {
      return '...' + match[0].replace(/\[\[|\]\]/g, '') + '...';
    }
    return content.substring(0, 100) + '...';
  };

  return (
    <div className="backlinks-panel">
      <div className="panel-header">
        <Link2 size={16} />
        <h4>Linked References</h4>
        <span className="backlinks-count">{backlinks.length}</span>
      </div>

      {backlinks.length === 0 ? (
        <div className="no-backlinks">
          <p>No notes link to this one yet</p>
        </div>
      ) : (
        <div className="backlinks-list">
          {backlinks.map(note => (
            <div
              key={note.id}
              className="backlink-item"
              onClick={() => onNoteClick(note)}
            >
              <div className="backlink-title">
                <ExternalLink size={14} />
                {note.title}
              </div>
              <div className="backlink-preview">
                {/* Show context around the link */}
                {getContextAroundLink(note.content, currentNote.title)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
