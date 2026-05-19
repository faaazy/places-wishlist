import { createContext, useContext, useEffect, useState } from "react";
import type { UserProfile } from "./types";
import { getUser, saveUser } from "@/shared/lib/storage";

interface UserContextValue {
  // its only for 1 user from localStorage for now without db
  user: UserProfile;
  updateUser: (data: Partial<UserProfile>) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export const UserContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<UserProfile>(() => {
    return (
      getUser() ?? {
        name: "User",
        avatar: "",
        bio: "",
        createdAt: new Date().toISOString(),
      }
    );
  });

  useEffect(() => {
    saveUser(user);
  }, [user]);

  const updateUser = (data: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...data }));
  };

  return (
    <UserContext.Provider
      value={{
        updateUser,
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
