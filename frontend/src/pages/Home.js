import React, { useEffect, useState, useContext } from 'react'
import { Container } from 'react-bootstrap'
import MyFeed from '../components/feed/MyFeed';
import { UserContext } from '../contexts/UserContext'


function Home() {  
    // constants
    const { user, setUser, isAuthenticated } = useContext(UserContext)
    
    // functions

    return (
        <Container>
          {user !== null && isAuthenticated ?
          <MyFeed
              className="mt-5"
              profileData={user}
          /> : 
          <h1 class="text-muted text-center">Please sign in.</h1>
          }
        </Container>
    );
}

export default Home;

