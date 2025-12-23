import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import JournalPage from './JournalPage';
import JournalCoverPage from './JournalCoverPage';
import './SimpleJournalBook.css';

function SimpleJournalBook({ entries, onNewEntry, onEditEntry, coverSettings }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  // Detect mobile vs desktop for navigation mode
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Create pages array with cover + entries (oldest first) + empty page at end
  // This mimics a real book where you start from the beginning and write forward
  const pages = [
    { type: 'cover', data: null },
    ...entries.map(entry => ({ type: 'entry', data: entry })),
    { type: 'empty', data: null }
  ];

  const totalPages = pages.length;

  // On mobile: navigate one page at a time
  // On desktop: navigate two pages (spread) at a time
  const pagesPerView = isMobile ? 1 : 2;
  const totalViews = isMobile ? totalPages : Math.ceil(totalPages / 2);
  const currentView = isMobile ? currentPage : Math.floor(currentPage / 2);

  const nextPage = () => {
    const maxPage = isMobile ? totalPages - 1 : (Math.ceil(totalPages / 2) - 1) * 2;
    if (currentPage < maxPage) {
      setDirection(1);
      setCurrentPage(currentPage + pagesPerView);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setDirection(-1);
      setCurrentPage(Math.max(0, currentPage - pagesPerView));
    }
  };

  // Calculate which pages to show
  const leftPageIndex = isMobile ? currentPage : Math.floor(currentPage / 2) * 2;
  const rightPageIndex = leftPageIndex + 1;
  const leftPageData = pages[leftPageIndex];
  const rightPageData = !isMobile && rightPageIndex < totalPages ? pages[rightPageIndex] : null;

  // Navigation state
  const canGoPrev = currentPage > 0;
  const canGoNext = isMobile
    ? currentPage < totalPages - 1
    : leftPageIndex + 2 < totalPages;

  const variants = {
    enter: (direction) => ({
      rotateY: direction > 0 ? 180 : -180,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction) => ({
      rotateY: direction < 0 ? 180 : -180,
      opacity: 0,
      scale: 0.8,
    }),
  };

  const renderPage = (pageData, pageIndex) => {
    if (!pageData) return null;

    if (pageData.type === 'cover') {
      return (
        <JournalCoverPage
          title={coverSettings?.title || "My Journal"}
          subtitle={entries.length > 0
            ? `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`
            : 'Begin your journey'
          }
          coverSettings={coverSettings}
        />
      );
    }

    if (pageData.type === 'entry') {
      return (
        <JournalPage
          entry={pageData.data}
          pageNumber={pageIndex + 1}
          side={pageIndex % 2 === 0 ? 'left' : 'right'}
          onEdit={onEditEntry}
        />
      );
    }

    if (pageData.type === 'empty') {
      return (
        <JournalPage
          entry={{
            date: format(new Date(), 'yyyy-MM-dd'),
            title: '',
            content: '',
            mood: null
          }}
          pageNumber={pageIndex + 1}
          side={pageIndex % 2 === 0 ? 'left' : 'right'}
          isEmpty={true}
          onStartWriting={onNewEntry}
        />
      );
    }
  };

  return (
    <div className="simple-journal-container">
      <div className="simple-journal-wrapper">
        <div className="journal-book-view">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentPage}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                rotateY: { type: 'spring', stiffness: 100, damping: 20 },
                opacity: { duration: 0.3 },
                scale: { duration: 0.3 }
              }}
              className="journal-spread-container"
              style={{
                transformStyle: 'preserve-3d',
                display: 'contents'
              }}
            >
              <div className="journal-page-container">
                {renderPage(leftPageData, leftPageIndex)}
              </div>

              {rightPageData && (
                <div className="journal-page-container">
                  {renderPage(rightPageData, rightPageIndex)}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="journal-controls">
        <button
          className="control-btn"
          onClick={prevPage}
          disabled={!canGoPrev}
          aria-label="Previous page"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="page-indicator">
          <BookOpen size={18} />
          <span>
            {isMobile
              ? `Page ${leftPageIndex + 1} of ${totalPages}`
              : `Pages ${leftPageIndex + 1}-${rightPageData ? rightPageIndex + 1 : leftPageIndex + 1} of ${totalPages}`
            }
          </span>
        </div>

        <button
          className="control-btn"
          onClick={nextPage}
          disabled={!canGoNext}
          aria-label="Next page"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}

export default SimpleJournalBook;
