import React, { useState, useMemo } from 'react';
import { useKnowledgeStore } from '../stores/knowledgeStore';
import { UnifiedKnowledgeUniverse } from '../features/knowledge/components/UnifiedKnowledgeUniverse';
import { StarModal } from '../features/knowledge/components/StarModal';
import { mapKnowledgeToConstellations } from '../features/knowledge/utils/constellationMapper';

/**
 * Unified Knowledge Universe Demo
 * Shows all constellations in one view → Click to zoom into card grid
 */
export default function ConstellationsDemo() {
  const { notes, books, media, collections } = useKnowledgeStore();
  const [selectedStar, setSelectedStar] = useState(null);

  // Transform knowledge data into constellation format
  const constellations = useMemo(
    () => mapKnowledgeToConstellations(notes, books, media, collections),
    [notes, books, media, collections]
  );

  const handleStarClick = (star) => {
    setSelectedStar(star);
  };

  const handleCloseModal = () => {
    setSelectedStar(null);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <UnifiedKnowledgeUniverse
        constellations={constellations}
        onStarClick={handleStarClick}
      />
      <StarModal star={selectedStar} onClose={handleCloseModal} />
    </div>
  );
}
