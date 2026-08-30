import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { supabase } from "@/shared/lib/supabase";
import { useAuth } from "@/entities/auth/model/AuthContext";
import { usePlaces } from "@/entities/place/model/PlaceContext";
import type {
  Group,
  GroupMember,
  GroupRole,
  SharedPlaceRow,
  SharedPlaceView,
} from "./types";

interface GroupContextValue {
  groups: Group[];
  sharedPlaces: SharedPlaceView[];
  loading: boolean;
  createGroup: (name: string, description?: string) => Promise<string>;
  renameGroup: (id: string, name: string) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  removeMember: (groupId: string, userId: string) => Promise<void>;
  joinGroup: (token: string) => Promise<string>;
  regenerateInvite: (groupId: string) => Promise<string>;
  setGroupPublic: (
    groupId: string,
    isPublic: boolean,
  ) => Promise<string | null>;
  setPlacePublic: (
    placeId: string,
    isPublic: boolean,
  ) => Promise<string | null>;
  sharePlace: (
    placeId: string,
    groupId: string,
    canEdit?: boolean,
  ) => Promise<void>;
  setCanEdit: (
    placeId: string,
    groupId: string,
    canEdit: boolean,
  ) => Promise<void>;
  unsharePlace: (placeId: string, groupId: string) => Promise<void>;
  copyToMine: (view: SharedPlaceView) => Promise<void>;
  getMembers: (groupId: string) => Promise<GroupMember[]>;
  refresh: () => Promise<void>;
}

const GroupContext = createContext<GroupContextValue | null>(null);

function toView(row: SharedPlaceRow, sharedGroups: string[]): SharedPlaceView {
  const p = row.place!;
  return {
    place: {
      id: p.id,
      title: p.title,
      description: p.description ?? "",
      coords: [p.lat, p.lng],
      category: p.category,
      wishRating: p.wish_rating as SharedPlaceView["place"]["wishRating"],
      status: p.status,
      createdAt: p.created_at,
    },
    groupId: row.group_id,
    groupName: row.group?.name ?? "",
    ownerName: p.owner?.name ?? "Unknown",
    canEdit: row.can_edit,
    sharedAt: row.shared_at,
    sharedGroups,
  };
}

export const GroupContextProvider = ({ children }: { children: ReactNode }) => {
  const { authUser } = useAuth();
  const { addPlace } = usePlaces();

  const [groups, setGroups] = useState<Group[]>([]);
  const [sharedPlaces, setSharedPlaces] = useState<SharedPlaceView[]>([]);
  const [loading, setLoading] = useState(true);

  const groupsRef = useRef<Group[]>([]);

  const loadGroups = useCallback(async () => {
    if (!authUser) {
      setGroups([]);
      groupsRef.current = [];
      return;
    }

    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("loadGroups error:", error);
      return;
    }

    const loaded = (data ?? []) as Group[];
    groupsRef.current = loaded;
    setGroups(loaded);
  }, [authUser]);

  const loadSharedPlaces = useCallback(async () => {
    if (!authUser) {
      setSharedPlaces([]);
      return;
    }

    const groupIds = groupsRef.current.map((g) => g.id);
    if (groupIds.length === 0) {
      setSharedPlaces([]);
      return;
    }

    const { data, error } = await supabase
      .from("shared_places")
      .select(
        "place_id, group_id, shared_by, can_edit, shared_at, group:groups(name), place:places(*, owner:users(name))",
      )
      .in("group_id", groupIds);

    if (error) {
      console.error("loadSharedPlaces error:", error);
      return;
    }

    const byPlace = new Map<
      string,
      { row: SharedPlaceRow; groupNames: Set<string> }
    >();
    const rows = (data ?? []) as Array<{
      place_id: string;
      group_id: string;
      shared_by: string;
      can_edit: boolean;
      shared_at: string;
      group?: { name: string } | { name: string }[] | null;
      place?: SharedPlaceRow["place"] | SharedPlaceRow["place"][] | null;
    }>;
    for (const raw of rows) {
      const place = Array.isArray(raw.place) ? raw.place[0] : raw.place;
      if (!place) continue;
      const groupName =
        (Array.isArray(raw.group) ? raw.group[0] : raw.group)?.name ?? "";
      const existing = byPlace.get(place.id);
      if (existing) {
        if (groupName) existing.groupNames.add(groupName);
        continue;
      }
      const row: SharedPlaceRow = {
        place_id: raw.place_id,
        group_id: raw.group_id,
        shared_by: raw.shared_by,
        can_edit: raw.can_edit,
        shared_at: raw.shared_at,
        group:
          (Array.isArray(raw.group) ? raw.group[0] : raw.group) ?? undefined,
        place,
      };
      byPlace.set(place.id, {
        row,
        groupNames: new Set<string>(groupName ? [groupName] : []),
      });
    }

    const views: SharedPlaceView[] = [];
    for (const { row, groupNames } of byPlace.values()) {
      views.push(toView(row, Array.from(groupNames)));
    }

    setSharedPlaces(views);
  }, [authUser]);

  const loadAll = useCallback(async () => {
    await loadGroups();
    await loadSharedPlaces();
    setLoading(false);
  }, [loadGroups, loadSharedPlaces]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll();
  }, [loadAll]);

  const createGroup = async (name: string, description = "") => {
    const { data, error } = await supabase.rpc("create_group", {
      group_name: name,
      group_description: description,
    });

    if (error) throw error;

    await loadGroups();
    return data as string;
  };

  const renameGroup = async (id: string, name: string) => {
    const { error } = await supabase
      .from("groups")
      .update({ name })
      .eq("id", id);

    if (error) throw error;
    await loadGroups();
  };

  const deleteGroup = async (id: string) => {
    const { error } = await supabase.from("groups").delete().eq("id", id);

    if (error) throw error;
    await loadGroups();
    await loadSharedPlaces();
  };

  const leaveGroup = async (groupId: string) => {
    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", authUser!.id);

    if (error) throw error;
    await loadGroups();
    await loadSharedPlaces();
  };

  const removeMember = async (groupId: string, userId: string) => {
    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", userId);

    if (error) throw error;
  };

  const joinGroup = async (token: string) => {
    const { data, error } = await supabase.rpc("join_group", {
      group_token: token,
    });

    if (error) throw error;

    await loadGroups();
    return data as string;
  };

  const regenerateInvite = async (groupId: string) => {
    const token = crypto.randomUUID();
    const { data, error } = await supabase
      .from("groups")
      .update({ invite_token: token })
      .eq("id", groupId)
      .select("invite_token")
      .single();

    if (error) throw error;

    await loadGroups();
    return (data?.invite_token as string) ?? token;
  };

  const setGroupPublic = async (groupId: string, isPublic: boolean) => {
    const value = isPublic ? crypto.randomUUID() : null;
    const { data, error } = await supabase
      .from("groups")
      .update({ share_token: value })
      .eq("id", groupId)
      .select("share_token")
      .single();

    if (error) throw error;

    await loadGroups();
    return (data?.share_token as string) ?? null;
  };

  const setPlacePublic = async (placeId: string, isPublic: boolean) => {
    const value = isPublic ? crypto.randomUUID() : null;
    const { data, error } = await supabase
      .from("places")
      .update({ share_token: value })
      .eq("id", placeId)
      .select("share_token")
      .single();

    if (error) throw error;

    return (data?.share_token as string) ?? null;
  };

  const sharePlace = async (
    placeId: string,
    groupId: string,
    canEdit = false,
  ) => {
    const { data: placeData, error: placeErr } = await supabase
      .from("places")
      .select("title, description")
      .eq("id", placeId)
      .single();

    if (placeErr) throw placeErr;
    if (!placeData) throw new Error("Place not found.");

    const { data: existingRows, error: existsErr } = await supabase
      .from("shared_places")
      .select("place:places(id, title, description)")
      .eq("group_id", groupId);

    if (existsErr) throw existsErr;

    const normalize = (value: string | null) =>
      (value ?? "").trim().toLowerCase();
    const targetTitle = normalize(placeData.title);
    const targetDescription = normalize(placeData.description);

    const existing = (existingRows ?? []) as Array<{
      place?:
        | { id: string; title: string | null; description: string | null }
        | {
            id: string;
            title: string | null;
            description: string | null;
          }[]
        | null;
    }>;

    const isDuplicate = existing.some((row) => {
      const p = Array.isArray(row.place) ? row.place[0] : row.place;
      return (
        !!p &&
        p.id !== placeId &&
        normalize(p.title) === targetTitle &&
        normalize(p.description) === targetDescription
      );
    });

    if (isDuplicate) {
      throw new Error(
        "A place with the same name and description is already in this group.",
      );
    }

    const { error } = await supabase.from("shared_places").upsert(
      {
        place_id: placeId,
        group_id: groupId,
        shared_by: authUser!.id,
        can_edit: canEdit,
      },
      { onConflict: "place_id, group_id" },
    );

    if (error) throw error;
    await loadSharedPlaces();
  };

  const setCanEdit = async (
    placeId: string,
    groupId: string,
    canEdit: boolean,
  ) => {
    const { error } = await supabase
      .from("shared_places")
      .update({ can_edit: canEdit })
      .eq("place_id", placeId)
      .eq("group_id", groupId);

    if (error) throw error;
    await loadSharedPlaces();
  };

  const unsharePlace = async (placeId: string, groupId: string) => {
    const { error } = await supabase
      .from("shared_places")
      .delete()
      .eq("place_id", placeId)
      .eq("group_id", groupId);

    if (error) throw error;
    await loadSharedPlaces();
  };

  const copyToMine = async (view: SharedPlaceView) => {
    await addPlace({
      ...view.place,
      id: crypto.randomUUID(),
      status: "wishlist",
    });
  };

  const getMembers = async (groupId: string) => {
    const { data, error } = await supabase
      .from("group_members")
      .select(
        "group_id, user_id, role, joined_at, user:users(name, avatar_url)",
      )
      .eq("group_id", groupId);

    if (error) throw error;

    const rows = (data ?? []) as Array<{
      group_id: string;
      user_id: string;
      role: GroupRole;
      joined_at: string;
      user?:
        | { name: string; avatar_url: string }
        | { name: string; avatar_url: string }[]
        | null;
    }>;

    return rows.map((raw) => {
      const member: GroupMember = {
        group_id: raw.group_id,
        user_id: raw.user_id,
        role: raw.role,
        joined_at: raw.joined_at,
      };
      const user = Array.isArray(raw.user) ? raw.user[0] : raw.user;
      if (user) member.user = user;
      return member;
    });
  };

  const refresh = useCallback(async () => {
    await loadGroups();
    await loadSharedPlaces();
  }, [loadGroups, loadSharedPlaces]);

  return (
    <GroupContext.Provider
      value={{
        groups,
        sharedPlaces,
        loading,
        createGroup,
        renameGroup,
        deleteGroup,
        leaveGroup,
        removeMember,
        joinGroup,
        regenerateInvite,
        setGroupPublic,
        setPlacePublic,
        sharePlace,
        setCanEdit,
        unsharePlace,
        copyToMine,
        getMembers,
        refresh,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useGroups = () => {
  const context = useContext(GroupContext);

  if (!context) {
    throw new Error("useGroups must be used within GroupContextProvider");
  }

  return context;
};
