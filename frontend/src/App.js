import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAccount } from 'wagmi'
import CreateProfile from './pages/CreateProfile/CreateProfile';
import Explore from './pages/Explore/Explore'
import Home from './pages/Home/Home';
import EditProfile from './pages/EditProfile/EditProfile'
import Profile from './components/authentication/Profile';
import NavbarComponent from './components/ui/Navbar';
import Footer from './components/ui/Footer';

function App() {
    // Replace isConnected with isAuthenticated 
    const { isConnected } = useAccount()

    return (
        <>
        <Router>
             <NavbarComponent />
            <Routes>
            
              {isConnected !== null
                  ? <Route path="/" element={<Home/>}></Route>
                  : <Route path="/" element={<Explore/>}></Route> 
              }
              <Route path="/home" element={<Home/>}></Route>
              <Route path="/explore" element={<Explore/>}></Route>
              <Route path="/edit-profile" element={<CreateProfile/>}></Route>
              <Route path="/:address/profile" element={<Profile/>}></Route>
            </Routes>
        </Router>
        </>
      );
}

export default App
