import type { HasTimestamps, ID } from "./common";

export interface Collection extends HasTimestamps {
  id: ID;
  workspaceId: ID;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  itemCount: number;
  /** Cover images (knowledge item thumbnails) for the collection card. */
  coverImageUrls?: string[];
}
