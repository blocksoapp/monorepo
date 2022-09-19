import React, { useState, useEffect } from 'react'
import { useParams } from "react-router-dom";
import { useAccount, useEnsName } from 'wagmi'
import { Badge, Button, Col, Container, Image, Row } from 'react-bootstrap'
import EnsName from '../ensName.js';
import { baseAPI, getCookie } from '../../utils.js'


function Profile() {

    const [isLoading, setIsLoading] = useState(Boolean)
    const [error, setError] = useState(Error)
    const [profileData, setProfileData] = useState({});
    const { address } = useParams();
 
    const fetchProfile = async () => {
        const url = `${baseAPI}/${address}/profile/`;
        const res = await fetch(url);
        if (res.status === 200) {
            var data = await res.json();
            setProfileData(data);
        }
        else if (res.status === 404) {
            // TODO show 404 feedback on page
            console.log('user has no profile')
        }
        else { console.log("unhandled case: ", res) }
    }

    useEffect(() => {
      fetchProfile()
    
    }, []) 


    const handleFollow = async () => {
        const url = `${baseAPI}/${address}/follow/`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
            'X-CSRFTOKEN': getCookie('csrftoken')
            },
            credentials: 'include'
        });
        await fetchProfile();
    }

  return (
    <Container fluid className="bg-light vh-100">

        {/* User Info Section */}
        <Container className="border-bottom border-success">

            {/* Profile picture */}
            <Row className="justify-content-center">
                <Col className="col-auto">
                    <Image
                        src={profileData.image}
                        roundedCircle
                        height="256px"
                        width="256px"
                        className="mb-1"
                    />
                </Col>
            </Row>

            {/* Address and ENS */}
            <Row className="justify-content-center mt-2">
                <Col className="col-auto text-center">
                    <EnsName address={address} />
                    <p>{address.substr(2,5) + "..." + address.substr(37,5)}</p>
                </Col>
            </Row>

            {/* Follower/Following counts and Follow button */}
            <Row className="justify-content-center">
                <Col className="col-auto">
                    <h5>
                        <Badge bg="secondary">
                            {profileData["numFollowers"]}
                            {profileData["numFollowers"] === 1 ?
                                " Follower" : " Followers"}
                        </Badge> 
                    </h5>
                </Col>
                <Col className="col-auto">
                    <h5>
                        <Badge bg="secondary">
                            {profileData["numFollowing"]} Following
                        </Badge> 
                    </h5>
                </Col>
                <Col className="col-auto">
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleFollow}>Follow
                    </Button> 
                </Col>
            </Row>

            {/* Bio blurb */}
            <Row className="justify-content-center mt-3">
                <Col className="col-auto">
                    <p>{profileData["bio"]}</p>
                </Col>
            </Row>
        </Container>

        {/* Posts Section */}
        <Container>
            {profileData["posts"] && profileData["posts"].map(post => (
                <div>
                <div>{post.author}</div>
                <div>{post.text}</div>
                <div>{post.imgUrl}</div>
                <div>{post.created}</div>
                </div>
            ))}
        </Container>

    </Container>
  )
}

export default Profile
