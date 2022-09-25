import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Col, Image, Row } from 'react-bootstrap'
import { useEnsName, useEnsAvatar } from 'wagmi'
import Blockies from 'react-blockies';

function ListItem({userAddress, imageUrl, bio, index, numFollowers, numFollowing}) {

    // state
    const [pfpUrl, setPfpUrl] = useState(null)
    const ensAvatar = useEnsAvatar({addressOrName: userAddress })
    const { data, isLoading } = useEnsName({ address: userAddress })

    // react-router dependency
    const navigate = useNavigate()
    
    // Abbreviate address
    const getAbbrAddress = function(address) {
        return address.substr(2,5) + "..." + address.substr(37,5);
    }

    // Show ENS Name
    const displayName = () => {
        if (isLoading) return <p>Fetching name…</p>
        if (!data) return <h4> {getAbbrAddress(userAddress)} </h4>
        else if(data) return <h4> {data} </h4>
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
    <div className="card-body d-flex flex-column justify-content-center p-3 mb-5 align-items-center rounded border"
        onClick={handleClick}
        style={{ cursor: "pointer"}} 
    >
            {/*
            Image here
            Make display image function reusable from wallet feed
            */}
            {pfpUrl === null
            ? <Blockies
                seed={userAddress}
                size={31}
                scale={8}
                className="rounded-circle"
                color="#ff5412"
                bgColor="#ffb001"
                spotColor="#4db3e4"
                />
            : <Image
                src={pfpUrl}
                height="256px"
                width="256px"
                roundedCircle
                />
            }
            <div className="mt-3">
                {displayName()}
            </div>
            <div>
                <p>{bio}</p>
            </div>
            <Row className="justify-content-center mt-3 mb-3">
                <Col className="col-auto">
                    <h5>
                        <Badge bg="secondary">
                            {numFollowers}
                            {numFollowers === 1 ?
                                " Follower" : " Followers"}
                        </Badge>
                    </h5>
                </Col>
                <Col className="col-auto">
                    <h5>
                        <Badge bg="secondary">
                            {numFollowing} Following
                        </Badge>
                    </h5>
                </Col>
            </Row>
    </div>
  )
}

export default ListItem