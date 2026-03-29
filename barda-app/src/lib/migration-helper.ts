/**
 * One-time localStorage → DB migration helper
 *
 * When a user logs in for the first time after the DB integration,
 * migrate their existing localStorage data to Supabase.
 * Runs once per user (tracked via STORAGE_KEYS.MIGRATED flag).
 */

import { STORAGE_KEYS } from "@/lib/constants";
import {
  saveProfile,
  saveDiary,
  saveDrawerItems,
  saveChallenge,
  saveChecklist,
  type ProfileData,
  type DrawerItem,
  type ChallengeState,
} from "@/lib/user-data-repository";

export async function migrateLocalStorageToDB(userId: string): Promise<void> {
  if (typeof window === "undefined") return;

  // Check if already migrated for this user
  const migratedKey = `${STORAGE_KEYS.MIGRATED}_${userId}`;
  if (localStorage.getItem(migratedKey)) return;

  try {
    // Migrate profile
    const profileRaw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (profileRaw) {
      const profile: ProfileData = JSON.parse(profileRaw);
      await saveProfile(userId, profile);
    }

    // Migrate drawer items
    const drawerRaw = localStorage.getItem(STORAGE_KEYS.DRAWER);
    if (drawerRaw) {
      const items: DrawerItem[] = JSON.parse(drawerRaw);
      if (items.length > 0) {
        await saveDrawerItems(userId, items);
      }
    }

    // Migrate challenge
    const challengeRaw = localStorage.getItem(STORAGE_KEYS.CHALLENGE);
    if (challengeRaw) {
      const challenge: ChallengeState = JSON.parse(challengeRaw);
      await saveChallenge(userId, challenge);
    }

    // Migrate recent diary entries (last 30 days)
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const diaryRaw = localStorage.getItem(STORAGE_KEYS.diary(dateKey));
      if (diaryRaw) {
        const entry = JSON.parse(diaryRaw);
        await saveDiary(userId, dateKey, entry);
      }

      // Migrate checklist for this date
      const checksRaw = localStorage.getItem(STORAGE_KEYS.checks(dateKey));
      if (checksRaw) {
        const checks = JSON.parse(checksRaw);
        await saveChecklist(
          userId,
          dateKey,
          checks.am ?? [],
          checks.pm ?? [],
        );
      }
    }

    // Mark as migrated
    localStorage.setItem(migratedKey, "true");
  } catch {
    // Migration is best-effort; don't block the user
  }
}
