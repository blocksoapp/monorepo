import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Explore from "./pages/Explore";
import Home from "./pages/Home";
import EditProfile from "./pages/EditProfile";
import ViewProfile from "./pages/ViewProfile";
import PostPage from "./pages/PostPage";
import NavbarComponent from "./components/ui/Navbar";
import { UserContext } from "./contexts/UserContext";
import Follow from "./pages/Follow";
import { useEffect } from "react";
import { apiGetUser } from "./api";
import { useSIWE } from "connectkit";

function App(props) {
  // Constants
  const { signedIn } = useSIWE();
  // State
  const [user, setUser] = useState(null);

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
