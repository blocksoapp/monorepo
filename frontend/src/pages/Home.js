import React, { useEffect, useState, useContext } from 'react'
import { Container } from 'react-bootstrap'
import Feed from '../components/feed/Feed';
import { UserContext } from '../contexts/UserContext'


function Home() {  
    // constants
    const { user, setUser, isAuthenticated } = useContext(UserContext)
    
    // functions

    return (
        <Container>
          {user !== null && isAuthenticated ?
          <Feed
              className="mt-5"
              profileData={user}
              setProfileData={setUser}
              author={user["address"]}
              user={user}
          /> : 
          <h1 class="text-muted text-center">Please sign in.</h1>
          }
        </Container>
    );
}

export default Home;

