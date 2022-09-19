import React, { useState, useEffect } from 'react'
import { Button } from 'react-bootstrap'
import { useAccount, useNetwork, useSignMessage, useEnsName } from 'wagmi'
import { SiweMessage } from 'siwe'
import { baseAPI, getCookie } from '../../utils.js'


function SignInButton() {
    const [nonceData, setNonceData] = useState('')
    const [addressSiwe, setAddressSiwe] = useState('')
    const [isLoading, setIsLoading] = useState(Boolean)
    const [isAuthenticated, setIsAuthenticated] = useState(Boolean)
    const [error, setError] = useState(Error)

// Fetch nonce from backend + update nonce state
    const fetchNonce = async () => {
        try {
            const url = `${baseAPI}/auth/nonce/`
            const nonceRes = await fetch(url)
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
    const { address, isConnected } = useAccount()
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
          uri: `${baseAPI}/auth/login/` ,
          nonce: nonceData
        })
        message = message.prepareMessage();
        const signature = await signMessageAsync({
          message: message,
        })

        console.log(message)
        console.log(signature)

       // Login / Verify signature
        const url = `${baseAPI}/auth/login/`
        const loginRes = await fetch(url, {
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
          console.log('res is ok')
          setIsAuthenticated(true)
          setAddressSiwe(address)
        }
      } catch (error) {
        setIsLoading(false)
        setNonceData(undefined)
        setError(error)
        fetchNonce()
      }
    }

    const signOut = async () => {
      try {
        const url = `${baseAPI}/auth/logout/` 
        const logoutRes = await fetch(url, {
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
    <div className='pb-1'>
      { !isAuthenticated ? 
        <Button disabled={!nonceData || isLoading || !isConnected } onClick={signIn}> Sign In</Button> :
        <Button onClick={signOut}>Sign out</Button> }
        {addressSiwe}
    </div>
  );
}

export default SignInButton
