import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAccount } from 'wagmi'
import CreateProfile from './pages/CreateProfile/CreateProfile';
import Explore from './pages/Explore';
import Home from './pages/Home/Home';
import EditProfile from './pages/EditProfile/EditProfile'

function App() {
    const { isConnected } = useAccount()

    return (
        <Router>
            <Routes>

              {isConnected ? <Route path="/" element={<Home/>}></Route> : 
              <Route path="/" element={<Explore/>}></Route> 
              }

              <Route path="/home" element={<Home/>}></Route>
              <Route path="/explore" element={<Explore/>}></Route>
              <Route path="/create_profile" element={<CreateProfile/>}> </Route>
              <Route path="/edit_profile" element={<EditProfile/>}></Route>
            </Routes>
        </Router>
      );
}

export default App