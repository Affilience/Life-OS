export interface KnowledgeStar {
  id: string;
  title: string;
  content: string;
  type: 'note' | 'book' | 'media' | 'idea';
  collectionId: string;
  collectionName: string;
  position: [number, number, number]; // x, y, z coordinates
  size: number; // Star size based on importance
  connections: string[]; // IDs of connected knowledge pieces
  color: string; // Hex color based on category
  lastAccessed?: string;
  createdAt: string;
  tags?: string[];
  importance?: number; // 1-10 scale
}

export interface Constellation {
  id: string;
  name: string;
  color: string; // Theme color for this constellation
  stars: KnowledgeStar[];
  centerPosition: [number, number, number];
  radius: number; // Spread of stars
}

export interface ConstellationConnection {
  sourceId: string;
  targetId: string;
  strength: number; // 0-1, affects line opacity
}
