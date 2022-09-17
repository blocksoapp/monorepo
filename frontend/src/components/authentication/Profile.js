import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Button } from 'react-bootstrap'

function Profile() {

    const { address} = useAccount();
    // get(self, request, *args, **kwargs): Retrieve the Profile of the given address.

    
    /* 
    const handler = async () => {
        try {
            if(isConnected) {
                const res = await fetch(`http://localhost:8000/api/${address}/profile/`)
                if(res.status === 404) {
                    console.log('user has no profile')
                    // Redirect to CREATE A PROFILE COMPONENT
                } 
            } else return
            
        } catch (error) {
            console.log(error)
        }
    } 

    useEffect(() => {
      handler()
    
    }, []) */

  return (
    <div>
        Profile
        {address}
        <Button>Check profile exists</Button>
    </div>
  )
}

export default Profile