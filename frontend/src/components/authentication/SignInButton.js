import React, { useState, useEffect } from 'react'
import { Button } from 'react-bootstrap'
import { useAccount, useNetwork, useSignMessage } from 'wagmi'
import { SiweMessage } from 'siwe'
import { baseAPI, getCookie } from '../../utils.js'


function SignInButton() {
    const [nonceData, setNonceData] = useState('')
    const [isLoading, setIsLoading] = useState(Boolean)
    const [isAuthenticated, setIsAuthenticated] = useState(Boolean)
    const [error, setError] = useState(Error)

    // Dependencies from wagmi
    const { address, isConnected } = useAccount()
    const { chain: activeChain } = useNetwork()
    const { signMessageAsync } = useSignMessage()

// Fetch nonce from backend + update nonce state
    const fetchNonce = async () => {
        try {
            const url = `${baseAPI}/auth/nonce/`
            const nonceRes = await fetch(url)
            console.log('fetch nonce:', nonceRes)
            const data = await nonceRes.json()
            const nonce = data.nonce
            console.log("this is my nonce: ",nonce)
            setNonceData(nonce)
            console.log("this is my state nonce", nonceData)
        } catch (error) {
            console.log('Could not retrieve nonce:', error)
        }
    }

    const getUser = async () => {
      const url = `${baseAPI}/user/`
      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include'
      })
      console.log('fetched profile:', res)
      return res
    }


    // fetch user profile
    const checkProfileExists = async () => {
      const fetchUser = await getUser()
      if(fetchUser.status === 403) {
        console.log('cannot get user, log in again')
      } else if (fetchUser.status === 200) {
        const json = await fetchUser.json()
        console.log('json:', json)
        const profile = json.profile
        if(profile !== null) {
          // Load wallet feet
          console.log('here is your wallet feed')
        } else {
          // redirect to create profile page
          console.log('need to create profile')
        }
      }
      

    }
    
// Create a SIWE message for user to sign with nonce
    const signIn = async () => {
      try {
        // Check validity of chain/address
        const chainId = activeChain.id
        if (!address || !chainId) return 
        setIsLoading(true)

        console.log('nonce data before msg:', nonceData)

        const messageData = {
          address: address,
          statement: 'Hello I am,',
          domain: window.location.host ,
          version: '1',
          chainId,
          uri: `${baseAPI}/auth/login/` ,
          nonce: nonceData
        }

        console.log('nonce data after msg:', nonceData)

        console.log("message data: ", messageData)
         // Create SIWE message with pre-fetched nonce and sign with wallet
        var message = new SiweMessage(messageData)
        console.log("this is my messsge: ",message)
        message = message.prepareMessage();
        const signature = await signMessageAsync({
          message: message,
        })


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
        
        if (loginRes.status === 200 ) {
          setIsAuthenticated(true)
          setIsLoading(false)
          //setNonceData('')
          console.log('res is ok:', loginRes.status)
          // fetch route 
          
          
        } 
        else if (loginRes.status === 401 || 403) {
          throw new Error('Error verifying message') 
        } 
       
      } catch (error) {
        setIsLoading(false)
        //setNonceData(undefined)
        setError(error)
        //fetchNonce()
      }
    }

    const handleSignIn = async () => {
      await fetchNonce()
      await signIn()
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

        if(logoutRes.status === 200)  {
          setIsAuthenticated(false)
          fetchNonce()
        }
        else if(logoutRes.status === 400 || 403) console.log('logout error')
      } catch (error) {
        console.log(error)
      }
    }

          /* 
      0. You check if getCookie('sessionid') !== null
      0.1. if it is not null, then make the Sign In button disabled
      1. You GET /api/user/
      2. If you get a 403, you make the Sign In button enabled */

      const handleAuthentication = async () => {

        const checkForSessionId = () => {
          console.log('running checkforsessionid func')
          // check sessionid
          console.log("getsess id:", getCookie('sessionid'))
         if(getCookie('sessionid') !== null) {
          setIsAuthenticated(true)
          console.log('sessionid exists')
         } else {
          setIsAuthenticated(false)
          console.log('no session id, log in please')
          console.log('fetching nonce...')
          fetchNonce()
         }
       }

        checkForSessionId()
        // You GET /api/user/
        const getUserStatus = await getUser()
        const status = await getUserStatus.status
        if(status === 403) {
          console.log('Not authorized to do')
          // Enable sign in button -- remove disabled class 
        } else return

       
      } 

      // useEffect to load nonce on component render 
    useEffect(() => {
      handleAuthentication()
    }, []) 

    // useEffect to check authentication status
/* onClick={async () => {await handleSignIn()}} */

  return (
    <div className='pb-1'>
        {isAuthenticated ? <Button onClick={signOut}>Sign out</Button> :
        <Button id="signInButton" disabled={isLoading || !isConnected || isAuthenticated} onClick={signIn}> Sign In</Button>  }
        <Button id="signInButton" disabled={isLoading || isAuthenticated} onClick={handleSignIn}> Sign In static</Button> 
        <Button onClick={signOut}>Sign out static</Button>
        <Button onClick={checkProfileExists}>CheckProfile</Button>
    </div>
  );
}

export default SignInButton
