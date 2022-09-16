import React, { useState, useEffect } from 'react'
import { Button } from 'react-bootstrap'
import { useAccount, useNetwork, useSignMessage, useEnsName } from 'wagmi'
import { SiweMessage } from 'siwe'

function getCookie(name) {
  if (!document.cookie) {
    return null;
  }

  const xsrfCookies = document.cookie.split(';')
    .map(c => c.trim())
    .filter(c => c.startsWith(name + '='));

  if (xsrfCookies.length === 0) {
    return null;
  }
  return decodeURIComponent(xsrfCookies[0].split('=')[1]);
}


function SignInButton() {
    const [nonceData, setNonceData] = useState('')
    const [isLoading, setIsLoading] = useState(Boolean)
    const [isAuthenticated, setIsAuthenticated] = useState(Boolean)

// Fetch nonce from backend + update nonce state
    const fetchNonce = async () => {
        try {
            const nonceRes = await fetch('http://localhost:8000/api/auth/nonce/')
            const json = await nonceRes.json()
            const nonce = json.nonce
            setNonceData(nonce)
        } catch (error) {
            console.log('Could not retrieve nonce:', error)
        }
    }

// useEffect to load nonce on component render - BE SURE TO REMOVE ONCLICK CALL
    useEffect(() => {
      fetchNonce()
    }, [])
    

// Create a SIWE message for user to sign with nonce
    // Dependencies from wagmi
    const { address } = useAccount()
    const { chain: activeChain } = useNetwork()
    const { signMessageAsync } = useSignMessage()

    const signIn = async () => {
      try {
        // Check validity of chain/address
        const chainId = activeChain.id
        if (!address || !chainId) return
        setIsLoading(true)

         // Create SIWE message with pre-fetched nonce and sign with wallet
        var message = new SiweMessage({
          address: address,
          statement: 'Hello I am,',
          domain: window.location.host ,
          version: '1',
          chainId,
          uri: 'http://localhost:8000/api/auth/login/' ,
          nonce: nonceData
        })
        message = message.prepareMessage();
        const signature = await signMessageAsync({
          message: message,
        })

        console.log(message)
        console.log(signature)

       // Login / Verify signature
        const loginRes = await fetch('http://localhost:8000/api/auth/login/', {
          method: 'POST',
          body: JSON.stringify({ message: message, signature: signature }),
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFTOKEN': getCookie('csrftoken')
          },
          credentials: 'include'
        })
        
        if (!loginRes.ok) {
          throw new Error('Error verifying message') 
        } else if (loginRes.ok) {
          setIsLoading(false)
          //console.log({res: await loginRes.json() })
          console.log('res is ok')
          setIsAuthenticated(true)
          return {address}
        }
      } catch (error) {
        setIsLoading(false)
        setNonceData(undefined)
        fetchNonce()
      }
    }

    const signOut = async () => {
      try {
        const logoutRes = await fetch('http://localhost:8000/api/auth/logout/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFTOKEN': getCookie('csrftoken')
          },
          credentials: 'include'
        })
        if(logoutRes.ok) 
        setIsAuthenticated(false)
      } catch (error) {
        console.log(error)
      }
    }

  return (
    <div className='border'>
      { !isAuthenticated ? 
        <Button disabled={!nonceData || isLoading} onClick={signIn}> Sign In</Button> :
        <Button onClick={signOut}>Logout</Button> }
    </div>
  );
}

export default SignInButton
