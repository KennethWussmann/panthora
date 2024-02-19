import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import React, {
  createContext,
  useContext,
  type ReactNode,
  useState,
  useEffect,
} from "react";
import { type User } from "~/server/lib/user/user";
import { api } from "~/utils/api";

type UserContextType = {
  user: User | undefined;
  refetch: () => Promise<void>;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

type UserProviderProps = {
  children: ReactNode;
};

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { push } = useRouter();
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
  const {
    data: user,
    refetch,
    isLoading,
    isError,
    isRefetchError,
  } = api.user.me.useQuery();

  useEffect(() => {
    if (isError || isRefetchError) {
      setCurrentUser(undefined);

      signOut({ redirect: false })
        .then(() => {
          void push("/auth/signin?logout=true");
        })
        .catch(() => {
          // Do nothing
        });
    } else if (user) {
      setCurrentUser(user);
    }
  }, [user, isError, isRefetchError, push]);

  return (
    <UserContext.Provider
      value={{
        user: currentUser,
        isLoading,
        refetch: async () => {
          await refetch();
        },
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
