import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Button } from 'react-bootstrap'
import { baseAPI } from '../../utils'

function ProfileTemp() {

    const [addressSiwe, setAddressSiwe] = useState('')
    const [isLoading, setIsLoading] = useState(Boolean)
    const [error, setError] = useState(Error)

    const { isConnected, address } = useAccount();
 /*
    const handler = async () => {
        try {
            if(isConnected) {
                const res = await fetch(`${process.env.baseAPI}/api/${address}`)
                if(res.status === 404) {
                    console.log('user has no profile')
                    // Redirect to CREATE A PROFILE COMPONENT
                } 
            } else return
            
        } catch (error) {
            console.log(error)
        }
    } 

    // Fetch user when:
    useEffect(() => {
    const handler = async () => {
      try {
        const res = await fetch('/api/me')
        const json = await res.json()
        setState((x) => ({ ...x, address: json.address }))
      } catch (_error) {}
    }
    // 1. page loads
    handler()

    // 2. window is focused (in case user logs out of another window)
    window.addEventListener('focus', handler)
    return () => window.removeEventListener('focus', handler)
  }, [])

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

export default ProfileTemp