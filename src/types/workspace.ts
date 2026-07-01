import type { HasTimestamps, ID } from "./common";

export interface Workspace extends HasTimestamps {
  id: ID;
  name: string;
  /** Short slug used in URLs, e.g. "personal". */
  slug: string;
  description?: string;
  /** Emoji or short icon token rendered next to the name. */
  icon?: string;
  /** Accent color token (oklch/hex) used for the workspace badge. */
  color?: string;
  itemCount: number;
  collectionCount: number;
}
