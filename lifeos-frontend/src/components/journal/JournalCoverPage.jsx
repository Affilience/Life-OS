import React from 'react';
import { BookOpen } from 'lucide-react';
import './JournalCoverPage.css';

function JournalCoverPage({ title, subtitle }) {
  return (
    <div className="journal-cover">
      <div className="cover-content">
        <div className="cover-icon">
          <BookOpen size={64} />
        </div>
        <h1 className="cover-title">{title}</h1>
        {subtitle && <p className="cover-subtitle">{subtitle}</p>}

        <div className="cover-decoration">
          <div className="decoration-line" />
        </div>
      </div>
    </div>
  );
}

export default JournalCoverPage;
