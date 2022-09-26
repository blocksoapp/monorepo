import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAccount, useEnsName, useEnsAvatar } from 'wagmi'
import { Badge, Button, Col, Container, Image, Row } from 'react-bootstrap'
import EnsAndAddress from '../ensName.js';
import Post from '../post.js'; 
import { baseAPI, getCookie } from '../../utils.js'
import Blockies from 'react-blockies';
import { useUser } from '../../hooks';


function Profile() {
    // constants
    const { address } = useParams();
    const routerLocation = useLocation();
    const navigate = useNavigate();
    const ensAvatar = useEnsAvatar({addressOrName: address});
    const user = useUser();

    // state
    const [profileData, setProfileData] = useState({});
    const [pfpUrl, setPfpUrl] = useState(null);
 
    // functions
    const determineProfilePic = async () => {
        if ("image" in profileData && profileData["image"] !== "") {
            setPfpUrl(profileData["image"]);
        }
        else {
            setPfpUrl(ensAvatar["data"]);
        }
    }

    const fetchProfile = async () => {
        const url = `${baseAPI}/${address}/profile/`;
        const res = await fetch(url, {
            method: 'GET',
            credentials: 'include'
        });
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

    const handleUnfollow = async () => {
        const url = `${baseAPI}/${address}/follow/`;
        const res = await fetch(url, {
            method: 'DELETE',
            headers: {
            'X-CSRFTOKEN': getCookie('csrftoken')
            },
            credentials: 'include'
        });
        if (res.ok) {
            navigate("#");
        }
    }

    const handleFollow = async () => {
        const url = `${baseAPI}/${address}/follow/`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
            'X-CSRFTOKEN': getCookie('csrftoken')
            },
            credentials: 'include'
        });
        if (res.ok) {
            navigate("#");
        }
    }

    // effects
    useEffect(() => {
        fetchProfile();
    }, [routerLocation.key])

    useEffect(() => {
        determineProfilePic()

        return () => {
            if (pfpUrl === ensAvatar["data"]) {
                return;
            }
            if (ensAvatar["data"] !== "") {
                setPfpUrl(ensAvatar["data"]);
            }
        }

        }, [profileData])


  return (
    <Container fluid>

        {/* User Info Section */}
        <Container className="border-bottom border-light">

            {/* Profile picture */}
            <Row className="justify-content-center">
                <Col className="col-auto">
                    {pfpUrl === null
                    ? <Blockies
                        seed={address}
                        size={30}
                        scale={8}
                        className="rounded-circle"
                        color="#ff5412"
                        bgColor="#ffb001"
                        spotColor="#4db3e4"
                    />
                    : <Image
                        src={pfpUrl}
                        roundedCircle
                        height="256px"
                        width="256px"
                        className="mb-1"
                    />
                    }
                </Col>
            </Row>

            {/* Address and ENS */}
            <Row className="justify-content-center mt-2">
                <Col className="col-auto text-center">
                    <h5><EnsAndAddress address={address} /></h5>
                </Col>
            </Row>

            {/* Bio blurb */}
            <Row className="justify-content-center mt-3">
                <Col className="col-auto">
                    <p>{profileData["bio"]}</p>
                </Col>
            </Row>

            {/* Follower/Following counts and Follow button */}
            <Row className="justify-content-center mt-3 mb-3">
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
                    {user !== null && profileData["followedByMe"] === true
                        ? <Button
                            variant="primary"
                            size="sm"
                            onClick={handleUnfollow}
                            disabled={user !== null && user["address"] === address ? true : false}
                          >
                            Unfollow
                          </Button> 
                        : <Button
                            variant="primary"
                            size="sm"
                            onClick={handleFollow}
                            disabled={user !== null && user["address"] === address ? true : false}
                          >
                            Follow
                          </Button>
                    }
                </Col>
            </Row>

        </Container>

        {/* Posts Section */}
        <Container>
            {profileData["posts"] && profileData["posts"].map(post => (
                <Post
                    key={post.id}
                    author={post.author}
                    text={post.text}
                    imgUrl={post.imgUrl}
                    created={post.created}
                    pfpUrl={pfpUrl}
                    setPfpUrl={setPfpUrl}
                    refTx={post.refTx}
                />
            ))}
        </Container>

    </Container>
  )
}

export default Profile
