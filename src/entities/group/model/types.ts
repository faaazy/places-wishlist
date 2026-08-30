import type { Place, PlaceCategory } from "@/entities/place/model/types";

export type GroupRole = "admin" | "member";

export interface Group {
  id: string;
  name: string;
  description: string;
  created_by: string;
  invite_token: string | null;
  share_token: string | null;
  created_at: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  role: GroupRole;
  joined_at: string;
  user?: {
    name: string;
    avatar_url: string;
  };
}

interface SharedPlaceRowPlace {
  id: string;
  title: string;
  description: string | null;
  lat: number;
  lng: number;
  category: PlaceCategory;
  wish_rating: number;
  status: Place["status"];
  created_at: string;
  owner?: {
    name: string;
  };
}

export interface SharedPlaceRow {
  place_id: string;
  group_id: string;
  shared_by: string;
  can_edit: boolean;
  shared_at: string;
  group?: {
    name: string;
  };
  place?: SharedPlaceRowPlace;
}

export interface SharedPlaceView {
  place: Place;
  groupId: string;
  groupName: string;
  ownerName: string;
  canEdit: boolean;
  sharedAt: string;
  sharedGroups: string[];
}
