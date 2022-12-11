import React, { useContext, useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from 'react-bootstrap'
import {
    useAccount,
    useDisconnect,
    useNetwork,
    useSignMessage
} from 'wagmi'
import { ConnectKitButton } from "connectkit"
import { SiweMessage } from 'siwe'
import { UserContext } from '../../contexts/UserContext'
import { baseAPI, getCookie } from '../../utils.js'


function SignInButton({buttonText}) {
    const { setUser, isAuthenticated, setIsAuthenticated } = useContext(UserContext);
    const [nonceData, setNonceData] = useState('')
    const [isLoading, setIsLoading] = useState(Boolean)
    const [error, setError] = useState(Error)

    const routerLocation = useLocation()
    const navigate = useNavigate()

    // Dependencies from wagmi
    const { address, isConnected } = useAccount()
    const { disconnect } = useDisconnect()
    const { chain: activeChain } = useNetwork()
    const { signMessageAsync } = useSignMessage()

// Fetch nonce from backend + update nonce state
    const fetchNonce = async () => {
        try {
            const url = `${baseAPI}/auth/nonce/`
            const nonceRes = await fetch(url)
            const data = await nonceRes.json()
            const nonce = data.nonce
            setNonceData(nonce)
        } catch (error) {
            console.log('Could not retrieve nonce:', error)
        }
    }

    // Fetch user profile status
    const getUser = async () => {
      const url = `${baseAPI}/user/`
      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include'
      })
      return res
    }

    // Check profile status and redirect if necessary
    const checkProfileExists = async () => {
      const fetchUser = await getUser()
      if(fetchUser.status === 403) {
        console.log('cannot get user, log in again')
      } else if (fetchUser.status === 200) {
        const json = await fetchUser.json()
        setUser(json);
        navigate(routerLocation.path)
      }
    }
    
    // Create a SIWE message for user to sign with nonce
    const signIn = async () => {
      try {
        // Check validity of chain/address
        const chainId = activeChain.id
        if (!address || !chainId) return 
        setIsLoading(true)

        const messageData = {
          address: address,
          statement: 'Hello I am,',
          domain: window.location.host ,
          version: '1',
          chainId,
          uri: `${baseAPI}/auth/login/` ,
          nonce: nonceData
        }

         // Create SIWE message with pre-fetched nonce and sign with wallet
        var message = new SiweMessage(messageData)
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
          setNonceData('')
          // Check if profile exists
          checkProfileExists()
        
        } 
        else if (loginRes.status === 401 || 403) {
          throw new Error('Error verifying message') 
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

        if(logoutRes.status === 200)  {
          setIsAuthenticated(false)
          setUser(null);
          navigate(routerLocation.path);
          fetchNonce()
        }
        else if(logoutRes.status === 400 || 403) console.log('logout error')
      } catch (error) {
        console.log(error)
      }

      // disconnect the wallet
      disconnect();
    }

      // Function to handle authentication on refresh 
      const handleAuthentication = async () => {
        // You GET /api/user/
        const resp = await getUser()
        const status = resp.status

        if(status === 200) {
            var user = await resp.json();
            setUser(user);
            setIsAuthenticated(true); 
        }
        else { 
            fetchNonce();
            setUser(null);
            setIsAuthenticated(false);
        }
      }

      // useEffect to load nonce on component render 
    useEffect(() => {
      handleAuthentication()
    }, []);

    /*
     * Start the sign in process when
     * a user connects their wallet.
     */
    useEffect(() => {
        // do nothing when wallet is disconnected
        if (!isConnected) {
            return
        }
        signIn();
    }, [isConnected]);


  return (
    <div className='pb-1'>
        {isAuthenticated
            ? <Button variant="light" onClick={signOut}>Sign out</Button>
            : <ConnectKitButton label={buttonText} />
        }
    </div>
  );
}

export default SignInButton
