import { useEffect, useState } from "react";
import { apiGetExplore } from "../api";
import { SuggestedUserContext } from "../contexts/SuggestedUserContext";
import { UserContext } from "../contexts/UserContext";
import { WagmiMiddleware } from "./WagmiMiddleware";
import { RainbowkitMiddleware } from "./RainbowkitMiddleware";


function Middleware({children}) {

    // state
    const [user, setUser] = useState(null);
    const [suggestedFeedData, setSuggestedFeedData] = useState(null);

    const loadSuggestedFeedData = async () => {
        const res = await apiGetExplore();
        if (res.ok) {
            const json = await res.json();
            setSuggestedFeedData(json);
        } else {
            console.log("Failed to load suggested feed data.");
        }
    };

    /*
     * Load the suggested feeds context on mount.
     */
    useEffect(() => {
        if (suggestedFeedData) return;
        loadSuggestedFeedData();
    }, []);


  return (
    <>
        <UserContext.Provider value={{ user, setUser }}>
            <SuggestedUserContext.Provider
                value={{ suggestedFeedData, setSuggestedFeedData }}
            >
                <WagmiMiddleware>
                    <RainbowkitMiddleware>
                        {children}
                    </RainbowkitMiddleware>
                </WagmiMiddleware>
            </SuggestedUserContext.Provider>
        </UserContext.Provider>
    </>
  );
}

export default Middleware;
