import type { Constellation, KnowledgeStar, ConstellationConnection } from '../types/constellation';

/**
 * Convert knowledge store data into constellation format
 * Each content TYPE becomes a constellation (YouTube, Books, Notes, Folders)
 * Each note/book/media becomes a star
 */
export function mapKnowledgeToConstellations(
  notes: any[],
  books: any[],
  media: any[],
  collections: any[]
): Constellation[] {
  const constellations: Constellation[] = [];
  let constellationIndex = 0;

  // Create YouTube Videos constellation
  const youtubeMedia = media.filter(m => m.type === 'youtube' || m.type === 'video');
  if (youtubeMedia.length > 0) {
    const stars = youtubeMedia.map((m, i) =>
      createStarFromMedia(m, { id: 'youtube', name: 'YouTube Videos', color: '#e74c3c' }, i)
    );

    constellations.push({
      id: 'youtube-constellation',
      name: 'YouTube Videos',
      color: '#e74c3c',
      stars,
      centerPosition: getConstellationPosition(constellationIndex++, 4),
      radius: Math.max(15, stars.length * 2)
    });
  }

  // Create Books constellation
  if (books.length > 0) {
    const stars = books.map((b, i) =>
      createStarFromBook(b, { id: 'books', name: 'Books', color: '#3498db' }, i)
    );

    constellations.push({
      id: 'books-constellation',
      name: 'Books',
      color: '#3498db',
      stars,
      centerPosition: getConstellationPosition(constellationIndex++, 4),
      radius: Math.max(15, stars.length * 2)
    });
  }

  // Create General Notes constellation
  if (notes.length > 0) {
    const stars = notes.map((n, i) =>
      createStarFromNote(n, { id: 'notes', name: 'Notes', color: '#2ecc71' }, i)
    );

    constellations.push({
      id: 'notes-constellation',
      name: 'Notes',
      color: '#2ecc71',
      stars,
      centerPosition: getConstellationPosition(constellationIndex++, 4),
      radius: Math.max(15, stars.length * 2)
    });
  }

  // Create Folders/Collections constellation
  if (collections.length > 0) {
    const stars = collections.map((c, i) =>
      createStarFromCollection(c, i)
    );

    constellations.push({
      id: 'folders-constellation',
      name: 'Folders',
      color: '#f39c12',
      stars,
      centerPosition: getConstellationPosition(constellationIndex++, 4),
      radius: Math.max(15, stars.length * 2)
    });
  }

  return constellations;
}

/**
 * Get position for constellation in 3D space
 */
function getConstellationPosition(index: number, total: number): [number, number, number] {
  const angle = (index / total) * Math.PI * 2;
  const distance = 50;
  return [
    Math.cos(angle) * distance,
    (Math.random() - 0.5) * 20, // Some vertical variation
    Math.sin(angle) * distance
  ];
}

/**
 * Create a star from a note
 */
function createStarFromNote(note: any, collection: any, index: number): KnowledgeStar {
  // Calculate importance based on connections and length
  const importance = Math.min(10,
    (note.linkedTo?.length || 0) +
    (note.linkedFrom?.length || 0) +
    Math.floor(note.content.length / 500)
  );

  // Random position within constellation radius
  const angle = (index / 8) * Math.PI * 2;
  const radius = 10 + Math.random() * 15;
  const height = (Math.random() - 0.5) * 10;

  return {
    id: note.id,
    title: note.title,
    content: note.content,
    type: 'note',
    collectionId: collection.id,
    collectionName: collection.name,
    position: [
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    ],
    size: 0.5 + (importance / 10) * 1.5, // 0.5 to 2.0
    connections: [...(note.linkedTo || []), ...(note.linkedFrom || [])],
    color: getColorForType('note', collection.color),
    lastAccessed: note.updatedAt,
    createdAt: note.createdAt,
    tags: note.tags,
    importance
  };
}

/**
 * Create a star from a book
 */
function createStarFromBook(book: any, collection: any, index: number): KnowledgeStar {
  const importance = Math.min(10,
    (book.notes?.length || 0) * 2 +
    (book.rating || 0)
  );

  const angle = (index / 8) * Math.PI * 2;
  const radius = 10 + Math.random() * 15;
  const height = (Math.random() - 0.5) * 10;

  return {
    id: book.id,
    title: book.title,
    content: book.description || `${book.title} by ${book.author}`,
    type: 'book',
    collectionId: collection.id,
    collectionName: collection.name,
    position: [
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    ],
    size: 0.7 + (importance / 10) * 1.3,
    connections: book.notes || [],
    color: getColorForType('book', collection.color),
    lastAccessed: book.startedAt,
    createdAt: book.createdAt,
    tags: book.tags,
    importance
  };
}

/**
 * Create a star from media
 */
function createStarFromMedia(mediaItem: any, collection: any, index: number): KnowledgeStar {
  const importance = Math.min(10, (mediaItem.notes?.length || 0) * 2 + 3);

  const angle = (index / 8) * Math.PI * 2;
  const radius = 10 + Math.random() * 15;
  const height = (Math.random() - 0.5) * 10;

  return {
    id: mediaItem.id,
    title: mediaItem.title,
    content: `${mediaItem.type} by ${mediaItem.creator}`,
    type: 'media',
    collectionId: collection.id,
    collectionName: collection.name,
    position: [
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    ],
    size: 0.6 + (importance / 10) * 1.2,
    connections: mediaItem.notes || [],
    color: getColorForType('media', collection.color),
    lastAccessed: mediaItem.watchedAt,
    createdAt: mediaItem.createdAt,
    tags: mediaItem.tags,
    importance
  };
}

/**
 * Create a star from a collection/folder
 */
function createStarFromCollection(collection: any, index: number): KnowledgeStar {
  const importance = Math.min(10, (collection.items?.length || 0));

  const angle = (index / 8) * Math.PI * 2;
  const radius = 10 + Math.random() * 15;
  const height = (Math.random() - 0.5) * 10;

  return {
    id: collection.id,
    title: collection.name,
    content: collection.description || collection.name,
    type: 'note', // Use 'note' type for folders
    collectionId: 'folders',
    collectionName: 'Folders',
    position: [
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    ],
    size: 0.8 + (importance / 10) * 1.2,
    connections: collection.items || [],
    color: collection.color || '#f39c12',
    lastAccessed: collection.updatedAt,
    createdAt: collection.createdAt,
    tags: [],
    importance
  };
}

/**
 * Get color for knowledge type with cosmic theme
 */
function getColorForType(type: string, baseColor: string): string {
  const colors: Record<string, string> = {
    note: '#a78bfa', // Purple
    book: '#60a5fa', // Blue
    media: '#f472b6', // Pink
    idea: '#34d399' // Green
  };
  return colors[type] || baseColor;
}

/**
 * Extract connections between all stars across constellations
 */
export function extractConnections(constellations: Constellation[]): ConstellationConnection[] {
  const connections: ConstellationConnection[] = [];
  const allStars = constellations.flatMap(c => c.stars);

  allStars.forEach(star => {
    star.connections.forEach(targetId => {
      const targetStar = allStars.find(s => s.id === targetId);
      if (targetStar) {
        // Calculate strength based on mutual connections
        const mutualConnections = star.connections.filter(
          id => targetStar.connections.includes(id)
        ).length;
        const strength = Math.min(1, 0.3 + (mutualConnections * 0.2));

        connections.push({
          sourceId: star.id,
          targetId: targetStar.id,
          strength
        });
      }
    });
  });

  return connections;
}
