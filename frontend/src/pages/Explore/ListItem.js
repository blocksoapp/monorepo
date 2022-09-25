import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'react-bootstrap'
import { useEnsName, useEnsAvatar } from 'wagmi'

function ListItem({userAddress, imageUrl, index}) {

    // state
    const ensAvatar = useEnsAvatar({addressOrName: userAddress });
    const { data, isLoading } = useEnsName({ address: userAddress })

    // react-router dependency
    const navigate = useNavigate()
    // navigate to etherscan
    const etherscanUrl = `https://etherscan.io/address/${userAddress}`
    
    // Abbreviate address
    const getAbbrAddress = function(address) {
        return address.substr(2,5) + "..." + address.substr(37,5);
    }

    // Show ENS Name
    const displayName = () => {
        if (isLoading) return <p>Fetching name…</p>
        if (!data) return <a href={etherscanUrl} rel="noreferrer" target="_blank" > {getAbbrAddress(userAddress)} </a>
        else if(data) return <a href={etherscanUrl} rel="noreferrer" target="_blank" > {data} </a>
    }

    /* Sets the user's pfp to their ens avatar
    * if the user has not uploaded a profile pic.
    * Returns null if the user does not have an
    * ens avatar. That way a blockie will be
    * displayed instead.
    */
   

    // Navigate to user profile
    const handleClick = () => {
        console.log('view profile requested')
        navigate(`/${userAddress}/profile`)
    }

  return (
    <div className="d-flex flex-column justify-content-center p-3 mb-5 align-items-center border">
            {/*
            Image here
            Make display image function reusable from wallet feed
            */}
            <div>
                {displayName()}
            </div>
            <Button 
             className="btn-sm" 
             onClick={handleClick} >
                View Profile
            </Button>
    </div>
  )
}

export default ListItem