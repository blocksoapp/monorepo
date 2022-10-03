import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Badge, Button, Col, Container, Image, Row } from 'react-bootstrap'
import { useAccount, useEnsName, useEnsAddress, useEnsAvatar } from 'wagmi'
import EnsAndAddress from '../ensName.js';
import Post from '../post.js'; 
import { baseAPI, getCookie } from '../../utils.js'
import Blockies from 'react-blockies';
import { useUser } from '../../hooks';
import { apiGetPosts } from '../../api';
import PostsPlaceholder from '../PostsPlaceholder';
import ProfilePlaceholder from './ProfilePlaceholder';


function Profile() {
    // constants
    const { urlInput } = useParams();
    const routerLocation = useLocation();
    const navigate = useNavigate();
    const ensAvatar = useEnsAvatar({addressOrName: urlInput});
    const ensAddress = useEnsAddress({name: urlInput});
    const user = useUser();

    // state
    const [address, setAddress] = useState(null);
    const [loadingProfileData, setLoadingProfileData] = useState(true);
    const [profileData, setProfileData] = useState({});
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [posts, setPosts] = useState([]);
    const [pfpUrl, setPfpUrl] = useState(null);
 
    // functions
    const resolveAddress = (input) => {
        // input is an ens name, resolve it to an address
        if (input.endsWith(".eth")) {
            var resolved = ensAddress.data;
            if (resolved === null || resolved === undefined) {
                setAddress(input);
            }
            else {
                setAddress(resolved);
            }
        }

        // input is not an ens name, set address to the given input
        else {
            setAddress(input);
        }
    }

    const determineProfilePic = async () => {
        if ("image" in profileData && profileData["image"] !== "") {
            setPfpUrl(profileData["image"]);
        }
        else {
            setPfpUrl(ensAvatar["data"]);
        }
    }

    const fetchPosts = async () => {
        setLoadingPosts(true);
        const res = await apiGetPosts(address);

        if (res.status === 200) {
            var data = await res.json();
            setPosts(data["results"]);
            setLoadingPosts(false);
        }
        else { //TODO show error feedback
            setLoadingPosts(false);
            throw new Error("error fetching posts")
        }
    }

    const fetchProfile = async () => {
        const url = `${baseAPI}/${address}/profile/`;
        setLoadingProfileData(true);
        const res = await fetch(url, {
            method: 'GET',
            credentials: 'include'
        });
        if (res.status === 200) {
            var data = await res.json();
            setProfileData(data);
            determineProfilePic(); 
            setLoadingProfileData(false);
        }
        else if (res.status === 404) {
            // TODO show 404 feedback on page
            console.log('user has no profile')
            setLoadingProfileData(false);
        }
        else {
            console.log("unhandled case: ", res);
            setLoadingProfileData(false);
            throw new Error("error fetching profile");
        }
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
    /*
     * Clear existing profile and resolve the given address
     * from the url when the page is navigated to.
     */
    useEffect(() => {
        // reset state
        setAddress(null);
        setProfileData({});
        setPosts([]);
        setPfpUrl(null);

        // resolve the ens or address
        resolveAddress(urlInput);
    }, [urlInput, routerLocation.key])

    /* 
     * Fetch profile and posts when address is set.
     */
    useEffect(() => {
        if (address === null || address === undefined) {
            return;
        }

        fetchProfile();
        fetchPosts();
    }, [address])
        
    /* 
     * Resolve address when ensAddress changes.
     */
    useEffect(() => {
        if (
            ensAddress.data === null ||
            ensAddress.data === undefined
        ) {
            return;
        }

        resolveAddress(urlInput);
    }, [ensAddress])
        
    useEffect(() => {
        if (pfpUrl === ensAvatar["data"]) {
            return;
        }
        if (ensAvatar["data"] !== "") {
            setPfpUrl(ensAvatar["data"]);
        }
    }, [pfpUrl])

    useEffect(() => {
        // TODO clean this up once a job system is added in
        // https://github.com/blocksoapp/monorepo/issues/25
        // this refetches the profile if it was not found
        // the first time around, since currently a profile is
        // created in the backend when fetching posts
        if (posts.length === 0) {
            return;
        }
        if (Object.keys(profileData).length === 0) {
            fetchProfile();
        }
    }, [posts]);


  return (
    <Container className="justify-content-center">

        {/* show placeholder or profile data */}
        {loadingProfileData === true
        ? <Container className="justify-content-center"><ProfilePlaceholder /></Container>
        : <Container fluid>

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
        </Container>
        }

        {/* Posts Section -- show placeholder or posts */}
        {loadingPosts === true
             ? <PostsPlaceholder />
             : posts.map(post => (
                <Post
                    key={post.id}
                    author={post.author}
                    text={post.text}
                    imgUrl={post.imgUrl}
                    created={post.created}
                    pfp={pfpUrl}
                    refTx={post.refTx}
                />
        ))}

    </Container>
  )
}

export default Profile
