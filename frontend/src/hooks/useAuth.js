import { useContext, useEffect } from "react";
import { UserContext } from "../contexts/UserContext";
import { apiGetUser, apiPostLogin, apiPostLogout } from "../api";


export const useAuth = () => {
  // state
  const { user, setUser } = useContext(UserContext);

  /* Log user in. */
  const login = async (message, signature) => {
    const resp = await apiPostLogin(message, signature);

    if (resp.ok) {
      const data = await resp.json();
      setUser(data);
    }

    return Boolean(resp.ok);
  };

  /* Log user out. */
  const logout = async () => {
    const resp = await apiPostLogout();

    if (resp.ok) {
      setUser(null);
    }

    return Boolean(resp.ok);
  };

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

  return { user, login, logout };
};
