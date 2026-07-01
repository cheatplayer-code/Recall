"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Brain, FolderOpen, LayoutGrid, LogOut, Moon } from "lucide-react";

import { useAuth } from "@/features/auth";

import {
  PageContainer,
  PageHeader,
  LoadingState,
  ErrorState,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { queryKeys } from "@/lib/api/query-keys";
import { userService } from "@/services";
import { firstName } from "@/lib/knowledge-select";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useKnowledgeList } from "@/features/knowledge/hooks/use-knowledge";
import { useWorkspaces } from "@/features/workspaces/hooks/use-workspaces";
import { useCollections } from "@/features/collections/hooks/use-collections";
import type { User } from "@/types";

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

const PLAN_LABEL: Record<User["plan"], string> = {
  free: "Free",
  pro: "Pro",
  team: "Team",
};

function StatTile({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Brain;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-card/50 p-4 ring-1 ring-white/[0.06]">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground ring-1 ring-white/5">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div>
        <div className="text-lg font-semibold leading-none">{value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

/**
 * Settings — profile, plan and a summary of the user's memory. The display name
 * is editable (PATCH /users/me); everything else reflects live account state.
 * Recall is dark-mode only by design, surfaced here as a calm, honest note.
 */
export function SettingsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  const { data: user, isLoading, isError, refetch } = useCurrentUser();
  const { data: items = [] } = useKnowledgeList();
  const { data: workspaces = [] } = useWorkspaces();
  const { data: collections = [] } = useCollections();

  // Local edit draft; `null` means "untouched", so the field tracks the fetched
  // user until the user types — no effect needed to sync the two.
  const [draft, setDraft] = useState<string | null>(null);

  const updateProfile = useMutation({
    mutationFn: (fullName: string) => userService.updateMe({ fullName }),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.user.me(), updated);
      setDraft(null);
    },
  });

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Settings" />
        <div className="mt-6">
          <LoadingState label="Loading your profile…" />
        </div>
      </PageContainer>
    );
  }

  if (isError || !user) {
    return (
      <PageContainer>
        <PageHeader title="Settings" />
        <div className="mt-6">
          <ErrorState
            title="Couldn't load your profile"
            description="Something interrupted the connection. Please try again."
            onRetry={() => refetch()}
          />
        </div>
      </PageContainer>
    );
  }

  const name = draft ?? user.name;
  const dirty = name.trim().length > 0 && name.trim() !== user.name;

  return (
    <PageContainer className="space-y-10">
      <PageHeader
        title="Settings"
        description="Your profile, plan and memory at a glance."
      />

      {/* Profile */}
      <section className="space-y-4">
        <h2 className="font-editorial text-lg">Profile</h2>
        <div className="flex flex-col gap-5 rounded-2xl bg-card/50 p-5 ring-1 ring-white/[0.06] sm:flex-row sm:items-center">
          <span className="grid size-16 shrink-0 place-items-center rounded-full bg-accent text-xl font-medium text-accent-foreground ring-1 ring-white/10">
            {initials(user.name)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-editorial text-lg">{user.name}</p>
              <Badge variant="secondary">{PLAN_LABEL[user.plan]} plan</Badge>
            </div>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (dirty) updateProfile.mutate(name.trim());
          }}
          className="space-y-2"
        >
          <label htmlFor="display-name" className="text-sm font-medium">
            Display name
          </label>
          <div className="flex items-center gap-2">
            <Input
              id="display-name"
              value={name}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="How should we greet you?"
              className="max-w-sm"
              maxLength={120}
            />
            <Button type="submit" disabled={!dirty || updateProfile.isPending}>
              {updateProfile.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
          {updateProfile.isSuccess && !dirty && (
            <p className="text-xs text-success">
              Saved — we&apos;ll call you {firstName(user.name)}.
            </p>
          )}
        </form>
      </section>

      {/* Memory summary */}
      <section className="space-y-4">
        <h2 className="font-editorial text-lg">Your memory</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatTile icon={Brain} value={items.length} label="memories" />
          <StatTile icon={LayoutGrid} value={workspaces.length} label="workspaces" />
          <StatTile icon={FolderOpen} value={collections.length} label="collections" />
        </div>
      </section>

      {/* Appearance */}
      <section className="space-y-4">
        <h2 className="font-editorial text-lg">Appearance</h2>
        <div className="flex items-center gap-3 rounded-2xl bg-card/50 p-5 ring-1 ring-white/[0.06]">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground ring-1 ring-white/5">
            <Moon className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium">Dark theme</p>
            <p className="text-xs text-muted-foreground">
              Recall is designed dark-first — a calm, focused surface for your
              memories.
            </p>
          </div>
        </div>
      </section>

      {/* Account */}
      <section className="space-y-4">
        <h2 className="font-editorial text-lg">Account</h2>
        <div className="flex flex-col gap-3 rounded-2xl bg-card/50 p-5 ring-1 ring-white/[0.06] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Sign out</p>
            <p className="text-xs text-muted-foreground">
              End this session on this device.
            </p>
          </div>
          <Button
            variant="outline"
            disabled={logout.isPending}
            onClick={() =>
              logout.mutate(undefined, {
                onSuccess: () => router.replace("/login"),
              })
            }
          >
            <LogOut className="size-4" />
            {logout.isPending ? "Signing out…" : "Sign out"}
          </Button>
        </div>
      </section>
    </PageContainer>
  );
}
