import type { HasTimestamps, ID } from "./common";

export type SubscriptionPlan = "free" | "pro" | "team";

export interface User extends HasTimestamps {
  id: ID;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: SubscriptionPlan;
}
