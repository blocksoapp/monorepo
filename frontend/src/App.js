import React, { useState, useContext, createContext } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAccount } from 'wagmi'
import Explore from './pages/Explore'
import Home from './pages/Home';
import EditProfile from './pages/EditProfile'
import ViewProfile from './pages/ViewProfile';
import PostPage from './pages/PostPage';
import NavbarComponent from './components/ui/Navbar';
import { UserContext } from './contexts/UserContext'


function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(Boolean)
    const [user, setUser] = useState(null);
    
    return (
        <>
        <UserContext.Provider value={{ user, setUser, isAuthenticated, setIsAuthenticated }}>
          <Router>
              <NavbarComponent/>
              <Routes>
              
                {user !== null
                    ? <Route path="/" element={<Home/>}></Route>
                    : <Route path="/" element={<Explore/>}></Route> 
                }
                <Route path="/home" element={<Home/>}></Route>
                <Route path="/explore" element={<Explore/>}></Route>
                <Route path="/edit-profile" element={<EditProfile/>}></Route>
                <Route path="/:urlInput/profile" element={<ViewProfile/>}></Route>
                <Route path="/posts/:postId" element={<PostPage/>}></Route>
              </Routes>
          </Router>
        </UserContext.Provider>
        </>
      );
}

export default App
