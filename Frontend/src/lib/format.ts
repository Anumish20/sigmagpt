import type { Conversation } from "@/types";

export type ConversationGroup = { label: string; items: Conversation[] };

/** Bucket conversations into Today / Yesterday / Previous 7 days / Older. */
export function groupByDate(items: Conversation[]): ConversationGroup[] {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dayMs = 86_400_000;

  const buckets: Record<string, Conversation[]> = {
    Today: [],
    Yesterday: [],
    "Previous 7 days": [],
    Older: [],
  };

  for (const c of items) {
    const t = new Date(c.lastMessageAt).getTime();
    if (t >= startOfToday) buckets.Today.push(c);
    else if (t >= startOfToday - dayMs) buckets.Yesterday.push(c);
    else if (t >= startOfToday - 7 * dayMs) buckets["Previous 7 days"].push(c);
    else buckets.Older.push(c);
  }

  return Object.entries(buckets)
    .filter(([, v]) => v.length > 0)
    .map(([label, items]) => ({ label, items }));
}
