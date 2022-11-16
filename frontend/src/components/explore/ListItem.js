import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Col, Image, Row } from 'react-bootstrap'
import EnsAndAddress from "../EnsAndAddress";
import PfpResolver from "../PfpResolver";


function ListItem({userAddress, imageUrl, bio, numFollowers, numFollowing}) {

    // react-router dependency
    const navigate = useNavigate()
    
    // Navigate to user profile
    const handleClick = () => {
        console.log('view profile requested')
        navigate(`/${userAddress}/profile`)
    }


  return (
    <div className="card-body d-flex flex-column justify-content-center p-3 mb-5 align-items-center rounded border"
        onClick={handleClick}
        style={{ cursor: "pointer"}} 
    >
            {/* profile pic */}
            <PfpResolver
                address={userAddress}
                imgUrl={imageUrl}
                height="256px"
                width="256px"
                fontSize="1.75rem"
            />
            <div className="mt-3">
                <h4><EnsAndAddress address={userAddress}/></h4>
            </div>
            {bio &&
             <div className="pt-3 ps-5 pe-5">
                 <p>{bio}</p>
             </div>
            }
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
