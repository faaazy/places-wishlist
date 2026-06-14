import { createContext, useContext, useEffect, useState } from "react";
import type { UserProfile } from "./types";
import { getUser, saveUser } from "@/shared/lib/storage";
import { supabase } from "@/shared/lib/supabase";
import { useAuth } from "@/entities/auth/model/AuthContext";

interface UserContextValue {
  user: UserProfile;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

const guestMockData = {
  id: crypto.randomUUID(),
  name: "User",
  avatar: "",
  bio: "",
  createdAt: new Date().toISOString(),
};

export const UserContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<UserProfile>(() => {
    return getUser() ?? guestMockData;
  });

  const { authUser } = useAuth();

  const loadUserProfile = async (id: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    } else {
      setUser(data);
      return data;
    }
  };

  useEffect(() => {
    if (authUser === null) {
      setUser(guestMockData);
    } else {
      loadUserProfile(authUser.id).catch(() => {
        supabase
          .from("users")
          .insert({ id: authUser.id, name: "User" })
          .then(() => setUser({ ...guestMockData, id: authUser.id }));
      });
    }
  }, [authUser]);

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...data }));

    if (authUser !== null) {
      const { error } = await supabase
        .from("users")
        .update(data)
        .eq("id", authUser.id);

      if (error) throw error;
    } else {
      setUser((prev) => {
        saveUser({ ...prev, ...data });
        return { ...prev, ...data };
      });
    }
  };

  return (
    <UserContext.Provider
      value={{
        updateUserProfile,
        user,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context)
    throw new Error("useUser must be used within UserContextProvider only");

  return context;
};
