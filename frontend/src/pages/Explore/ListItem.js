import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Image } from 'react-bootstrap'
import { useEnsName, useEnsAvatar } from 'wagmi'
import Blockies from 'react-blockies';

function ListItem({userAddress, imageUrl, bio, index}) {

    // state
    const [pfpUrl, setPfpUrl] = useState(null)
    const ensAvatar = useEnsAvatar({addressOrName: userAddress })
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
   
     const determineProfilePic = async () => {
        if (imageUrl !== "") {
            setPfpUrl(imageUrl);
        }
        else {
            setPfpUrl(ensAvatar["data"]);
        }
    }
   
   

    // Navigate to user profile
    const handleClick = () => {
        console.log('view profile requested')
        navigate(`/${userAddress}/profile`)
    }

     // set profile pic
     useEffect(() => {
        determineProfilePic();
    }, [])

  return (
    <div className="d-flex flex-column justify-content-center p-3 mb-5 align-items-center border" onClick={handleClick}>
            {/*
            Image here
            Make display image function reusable from wallet feed
            */}
            {pfpUrl === null
            ? <Blockies
                seed={userAddress}
                size={20}
                scale={5}
                className="rounded-circle"
                color="#ff5412"
                bgColor="#ffb001"
                spotColor="#4db3e4"
                />
            : <Image
                src={pfpUrl}
                height="100px"
                width="100px"
                roundedCircle
                />
            }
            <div>
                {displayName()}
            </div>
            <div>
                <p>{bio}</p>
                <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Voluptas rerum accusantium excepturi deserunt facere dolore nulla alias itaque vero minima? Assumenda eaque inventore praesentium hic sequi ducimus rerum. Delectus, hic.</p>
            </div>
    </div>
  )
}

export default ListItem