import { useContext, useEffect } from "react";
import { UserContext } from "../contexts/UserContext";
import { apiGetUser, apiPostLogin, apiPostLogout } from "../api";


export const useUser = () => {
  // state
  const { user, setUser } = useContext(UserContext);

  /* On mount, get authed user. */
  useEffect(() => { 
    async function getUser() {
      const res = await apiGetUser();
      if (res.ok) {
        const json = await res.json();
        setUser(json);
      }
    }

    if (!user) getUser();
  }, []);


  return { user };
};
