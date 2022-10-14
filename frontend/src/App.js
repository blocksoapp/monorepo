import React, { useState, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAccount } from 'wagmi'
import Explore from './pages/Explore'
import Home from './pages/Home';
import EditProfile from './pages/EditProfile'
import ViewProfile from './pages/ViewProfile';
import NavbarComponent from './components/ui/Navbar';
import { useUser } from './hooks';


function App() {
    const user = useUser();

    return (
        <>
        <Router>
             <NavbarComponent />
            <Routes>
            
              {user !== null
                  ? <Route path="/" element={<Home/>}></Route>
                  : <Route path="/" element={<Explore/>}></Route> 
              }
              <Route path="/home" element={<Home/>}></Route>
              <Route path="/explore" element={<Explore/>}></Route>
              <Route path="/edit-profile" element={<EditProfile/>}></Route>
              <Route path="/:urlInput/profile" element={<ViewProfile/>}></Route>
            </Routes>
        </Router>
        </>
      );
}

export default App
