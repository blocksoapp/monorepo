import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Explore from "./pages/Explore";
import Home from "./pages/Home";
import EditProfile from "./pages/EditProfile";
import ViewProfile from "./pages/ViewProfile";
import Feeds from "./pages/Feeds";
import EditFeed from "./components/feed/write/EditFeed";
import ViewFeed from "./components/feed/read/ViewFeed";
import PostPage from "./pages/PostPage";
import NavbarComponent from "./components/ui/Navbar";
import { UserContext } from "./contexts/UserContext";
import FeedFollow from "./pages/FeedFollow";
import Follow from "./pages/Follow";
import { apiGetUser } from "./api";
import { useSIWE } from "connectkit";

function App(props) {
  // Constants
  const { signedIn } = useSIWE();
  // State
  const [user, setUser] = useState(null);

  const loadUserContext = async () => {
    const res = await apiGetUser();
    if (res.ok) {
      const json = await res.json();
      setUser(json);
    } else {
      console.log("Failed to load user data.");
    }
  };

  useEffect(() => {
    if (!signedIn) return;
    loadUserContext();
  }, [signedIn]);

  useEffect(() => {
    loadUserContext();
  }, []);

  return (
    <>
      <UserContext.Provider
        value={{
          user,
          setUser,
        }}
      >
        <Router>
          <NavbarComponent />
          <Routes>
            {user !== null && signedIn ? (
              <Route path="/" element={<Home />}></Route>
            ) : (
              <Route path="/" element={<Explore />}></Route>
            )}
            <Route path="/home" element={<Home />}></Route>
            <Route path="/explore" element={<Explore />}></Route>
            <Route path="/edit-profile" element={<EditProfile />}></Route>
            <Route path="/feeds/:feedId/edit" element={<EditFeed />}></Route>
            <Route path="/feeds/:feedId/follow" element={<FeedFollow />}></Route>
            <Route path="/feeds/:feedId" element={<ViewFeed />}></Route>
            <Route path="/feeds" element={<Feeds />}></Route>
            <Route path="/:urlInput/profile/" element={<ViewProfile />}></Route>
            <Route path="/posts/:postId" element={<PostPage />}></Route>
            <Route
              path="/:urlInput/profile/follow"
              element={<Follow />}
            ></Route>
          </Routes>
        </Router>
      </UserContext.Provider>
    </>
  );
}

export default App;
