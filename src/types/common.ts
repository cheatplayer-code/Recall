/** Shared primitive types used across all domains. */

export type ID = string;

/** ISO 8601 datetime string (e.g. "2026-06-27T09:30:00Z"). */
export type ISODateString = string;

/** Generic paginated response shape the backend is expected to return. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface HasTimestamps {
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
