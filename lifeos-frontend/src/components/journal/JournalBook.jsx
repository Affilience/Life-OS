import React, { useRef, useState, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { ChevronLeft, ChevronRight, Calendar, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import JournalPage from './JournalPage';
import JournalCoverPage from './JournalCoverPage';
import './JournalBook.css';

function JournalBook({ entries, onPageFlip, onSelectDate, onNewEntry }) {
  const bookRef = useRef();
  const [currentPage, setCurrentPage] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);

  const handleFlip = useCallback((e) => {
    setCurrentPage(e.data);
    if (onPageFlip) {
      onPageFlip(e.data);
    }
  }, [onPageFlip]);

  const nextPage = () => {
    bookRef.current?.pageFlip()?.flipNext();
  };

  const prevPage = () => {
    bookRef.current?.pageFlip()?.flipPrev();
  };

  const jumpToPage = (pageNumber) => {
    bookRef.current?.pageFlip()?.flip(pageNumber);
  };

  const totalPages = entries.length + 1; // +1 for cover

  return (
    <div className="journal-container">
      <div className="journal-wrapper">
        <HTMLFlipBook
          ref={bookRef}
          width={450}
          height={650}
          size="stretch"
          minWidth={300}
          maxWidth={900}
          minHeight={400}
          maxHeight={1300}
          showCover={true}
          flippingTime={1000}
          usePortrait={true}
          startPage={0}
          drawShadow={true}
          maxShadowOpacity={0.5}
          showPageCorners={true}
          disableFlipByClick={false}
          onFlip={handleFlip}
          className="journal-book"
          mobileScrollSupport={true}
        >
          {/* Cover page */}
          <div>
            <JournalCoverPage
              title="My Journal"
              subtitle={entries.length > 0
                ? `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`
                : 'Begin your journey'
              }
            />
          </div>

          {/* Journal entries */}
          {entries.map((entry, index) => (
            <div key={entry.id}>
              <JournalPage
                entry={entry}
                pageNumber={index + 1}
                side={index % 2 === 0 ? 'left' : 'right'}
              />
            </div>
          ))}

          {/* Empty page for new entry */}
          <div>
            <JournalPage
              entry={{
                date: format(new Date(), 'yyyy-MM-dd'),
                title: '',
                content: '',
                mood: null
              }}
              pageNumber={entries.length + 1}
              side={entries.length % 2 === 0 ? 'left' : 'right'}
              isEmpty={true}
              onStartWriting={onNewEntry}
            />
          </div>
        </HTMLFlipBook>
      </div>

      {/* Navigation Controls */}
      <div className="journal-controls">
        <button
          className="control-btn"
          onClick={prevPage}
          disabled={currentPage === 0}
          aria-label="Previous page"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="page-indicator">
          <BookOpen size={18} />
          <span>Page {currentPage} of {totalPages}</span>
        </div>

        <button
          className="control-btn"
          onClick={nextPage}
          disabled={currentPage >= totalPages - 1}
          aria-label="Next page"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Quick actions */}
      <div className="journal-quick-actions">
        <button
          className="action-btn"
          onClick={() => setShowCalendar(!showCalendar)}
          title="Jump to date"
        >
          <Calendar size={20} />
          <span>Jump to Date</span>
        </button>
      </div>
    </div>
  );
}

export default JournalBook;
