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
        // Check validity of chain/address
        const chainId = activeChain.id
        if (!address || !chainId) return

        setIsLoading(true)
         // Create SIWE message with pre-fetched nonce and sign with wallet
        var message = new SiweMessage({
        address: address,
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
      console.log({res: await loginRes.json() })

      if (!loginRes.ok) {
        throw new Error('Error verifying message') 
      } else if (loginRes.ok) {
        setIsLoading(false)
      }
      
    }

  return (
    <div>
        <Button onClick={signIn}>Sign in with Ethereum</Button>
        nonce: {nonceData}
        address: {address}
    </div>
  );
}

export default SignInButton
