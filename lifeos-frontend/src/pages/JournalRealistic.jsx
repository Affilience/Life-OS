import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import JournalBook from '../components/journal/JournalBook';
import { journalDB } from '../db/journalDB';

function JournalRealistic() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const allEntries = await journalDB.getAllEntries();
      setEntries(allEntries);
    } catch (error) {
      console.error('Failed to load entries:', error);
    }
  };

  const handleNewEntry = () => {
    navigate('/journal/write');
  };

  const handlePageFlip = (pageNumber) => {
    console.log('Flipped to page:', pageNumber);
  };

  const handleSelectDate = (date) => {
    console.log('Selected date:', date);
  };

  return (
    <div>
      <JournalBook
        entries={entries}
        onPageFlip={handlePageFlip}
        onSelectDate={handleSelectDate}
        onNewEntry={handleNewEntry}
      />
    </div>
  );
}

export default JournalRealistic;
