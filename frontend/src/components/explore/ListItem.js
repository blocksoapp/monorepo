import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Col, Image, Row } from 'react-bootstrap'
import { useEnsName, useEnsAvatar } from 'wagmi'
import { abbrAddress } from "../../utils";
import Pfp from "../Pfp";


function ListItem({userAddress, imageUrl, bio, numFollowers, numFollowing}) {

    // state
    const [pfpUrl, setPfpUrl] = useState(null)
    const ensAvatar = useEnsAvatar({
        addressOrName: userAddress,
        onSuccess(data) {
            // set the user's pfp to their ens avatar
            // if they haven't uploaded a profile pic
            if (data !== null) {
                if (pfpUrl === null || pfpUrl === "") {
                    setPfpUrl(data);
                }
            }
        }
    })
    const { data, isLoading } = useEnsName({ address: userAddress })

    // react-router dependency
    const navigate = useNavigate()
    
    // Show ENS Name
    const displayName = () => {
        if (isLoading) return <p>Fetching name…</p>
        if (!data) return <h4> {abbrAddress(userAddress)} </h4>
        else if(data) return <h4> {data} </h4>
    }

   
    // Navigate to user profile
    const handleClick = () => {
        console.log('view profile requested')
        navigate(`/${userAddress}/profile`)
    }

    /*
     * Sets the user's pfp to their ens avatar
     * if the user has not uploaded a profile pic.
     * If a user does not have an ens avatar or
     * a profile pic, then pfpUrl remains null and
     * a Blockie is shown instead.
     */
     useEffect(() => {
        if (imageUrl !== "") {
            setPfpUrl(imageUrl);
        }
        else {
            if (ensAvatar.isLoading === false && ensAvatar.data !== null) {
                setPfpUrl(ensAvatar.data);
            }
        }
    }, [imageUrl])


  return (
    <div className="card-body d-flex flex-column justify-content-center p-3 mb-5 align-items-center rounded border"
        onClick={handleClick}
        style={{ cursor: "pointer"}} 
    >
            {/* profile pic */}
            <Pfp
                height="256px"
                width="256px"
                imgUrl={pfpUrl}
                address={userAddress}
                ensName={data}
                fontSize="1.75rem"
            />
            <div className="mt-3">
                {displayName()}
            </div>
            <div className="pt-4 ps-5 pe-5">
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
