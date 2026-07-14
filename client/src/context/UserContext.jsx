import { createContext, useContext, useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";

import api from "../api/axios";
import { setClerkTokenGetter } from "../api/clerkToken";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();

  const [dbUser, setDbUser] = useState(null);

  const syncUser = async () => {
    try {
      const token = await getToken();

      const res = await api.post(
        "/users/create",
        {
          userId: user.id,
          name: user.fullName,
          email: user.primaryEmailAddress?.emailAddress,
          image: user.imageUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setDbUser(res.data);
      console.log("User synced with DB:", res.data);
      
    } catch (err) {
      console.log("User sync error");
    }
  };

  useEffect(() => {
    setClerkTokenGetter(getToken);

    return () => setClerkTokenGetter(null);
  }, [getToken]);

  useEffect(() => {
        if (isSignedIn && user && !dbUser) {
            syncUser();
        }
    }, [isSignedIn, user]);

    const value = {
        dbUser,
    };
    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;