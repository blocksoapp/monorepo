import { useEffect, useState } from "react";
import { baseAPI } from "../utils";


/*
 * Retrieves the signed in user.
 * Returns null if the user is not signed in.
 */
export function useUser() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const getUser = async () => {
            const url = `${baseAPI}/user/`;
            const res = await fetch(url, {
                method: 'GET',
                credentials: 'include'
            });
            if (!res.ok) {
                return;
            }
            const userData = await res.json();
            setUser(userData);
        }

        if (user !== null) {
            return;
        }

        getUser();
    }, [user]);

    return user;
}
