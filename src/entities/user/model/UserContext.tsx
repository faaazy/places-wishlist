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
  avatar_url: "",
  bio: "",
  created_at: new Date().toISOString(),
};

export const UserContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<UserProfile>(guestMockData);

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
      localStorage.setItem("cached_user_profile", JSON.stringify(data));
      setUser(data);
      return data;
    }
  };

  useEffect(() => {
    if (authUser === null) {
      setUser(getUser() ?? guestMockData);
    } else {
      loadUserProfile(authUser.id).catch((err) => {
        if (err?.code === "PGRST116") {
          supabase
            .from("users")
            .insert({ id: authUser.id, name: "User" })
            .then(({ error }) => {
              if (!error) setUser({ ...guestMockData, id: authUser.id });
            });
        } else {
          const cached = localStorage.getItem("cached_user_profile");
          if (cached) {
            setUser(JSON.parse(cached));
          } else {
            console.error("loadUserProfile error:", err);
          }
        }
      });
    }
  }, [authUser]);

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    const { name, bio, avatar_url } = data;
    const updatedData = { name, bio, avatar_url };

    setUser((prev) => {
      const next = { ...prev, ...data };
      localStorage.setItem("cached_user_profile", JSON.stringify(next));
      return next;
    });

    if (authUser !== null) {
      const { error } = await supabase
        .from("users")
        .update(updatedData)
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
