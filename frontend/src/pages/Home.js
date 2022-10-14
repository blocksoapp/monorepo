import React, { useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { useAccount } from 'wagmi'
import Feed from '../components/Feed/Feed';
import { useUser } from "../hooks/useUser"


function Home() {  
    // constants
    const user = useUser();
    const [profileData, setProfileData] = useState(null)
    const [loading, setLoading] = useState(true)

    // state
    useEffect(() => {
      setProfileData(user)
      console.log('setProfileData to user')
    }, [user])

    useEffect(() => {
      console.log('profile data recognized')
      setLoading(false)
        console.log('profile data: ', profileData)
    }, [profileData])
    
    
    // functions

    return (
        <Container>
          {user === null &&
          <h1 class="text-muted text-center">Please sign in.</h1>
          }
          {user !== null && profileData !== null && loading === false ?
          <Feed
              className="mt-5"
              profileData={profileData}
              setProfileData={setProfileData}
              author={user["address"]}
              user={user}
          /> : 
          <h1 class="text-muted text-center">Loading...</h1>
          }
        </Container>
    );
}

export default Home;
