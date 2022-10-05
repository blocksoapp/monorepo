import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Badge, Button, Col, Container, Image, Row } from 'react-bootstrap'
import { useAccount, useEnsAddress, useEnsAvatar } from 'wagmi'
import { utils as ethersUtils } from 'ethers';
import Post from '../post.js'; 
import { baseAPI, getCookie } from '../../utils.js'
import Blockies from 'react-blockies';
import { useUser } from '../../hooks';
import { apiGetPosts } from '../../api';
import PostsPlaceholder from '../PostsPlaceholder';
import PostsError from '../PostsError';
import PostsNotFound from '../PostsNotFound';
import ProfilePlaceholder from './ProfilePlaceholder';
import ProfileInvalid from './ProfileInvalid';
import ProfileEnsAndAddress from '../ProfileEnsAndAddress';


function Profile() {
    // constants
    const { urlInput } = useParams();
    const routerLocation = useLocation();
    const navigate = useNavigate();
    const ensAvatar = useEnsAvatar({addressOrName: urlInput});
    const ensAddress = useEnsAddress({
        name: urlInput,
        onSuccess(data) {
            if (data === null) {
                setAddress(urlInput);
            }
            else {
                setAddress(data);
            }
        },
        onError(error) {
            console.error(error);
            setAddress(urlInput);
        }
    });
    const user = useUser();

    // state
    const [address, setAddress] = useState(null);
    const [profileInvalid, setProfileInvalid] = useState(false);
    const [profileDataLoading, setProfileDataLoading] = useState(true);
    const [profileData, setProfileData] = useState({});
    const [postsLoading, setPostsLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [postsError, setPostsError] = useState(false);
    const [pfpUrl, setPfpUrl] = useState(null);
 
    // functions
    const resolveAddress = (input) => {
        // input is an ens name, resolve it to an address
        if (input.endsWith(".eth")) {

            // return if ens is still being resolved
            if (ensAddress.isLoading === true) {
                return;
            }

            // set ens if found otherwise use input from url
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
        setPostsLoading(true);
        const res = await apiGetPosts(address);

        if (res.status === 200) {
            var data = await res.json();
            setPosts(data["results"]);
            setPostsError(false);
            setPostsLoading(false);
        }
        else {
            setPostsError(true);
            setPostsLoading(false);
            console.error(res);
        }
    }

    const fetchProfile = async () => {
        const url = `${baseAPI}/${address}/profile/`;
        setProfileDataLoading(true);
        const res = await fetch(url, {
            method: 'GET',
            credentials: 'include'
        });
        if (res.status === 200) {
            var data = await res.json();
            setProfileData(data);
            determineProfilePic(); 
            setProfileDataLoading(false);
        }
        else if (res.status === 404) {
            console.log('profile not found, it will be created when fetching posts');
            setProfileDataLoading(false);
        }
        else {
            console.error(res);
            setProfileDataLoading(false);
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
            setProfileData({
                ...profileData,
                numFollowers: profileData["numFollowers"] - 1,
                followedByMe: false
            });
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
            setProfileData({
                ...profileData,
                numFollowers: profileData["numFollowers"] + 1,
                followedByMe: true
            });
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
        setProfileInvalid(false);
        setProfileData({});
        setProfileDataLoading(true);
        setPosts([]);
        setPostsLoading(true);
        setPostsError(false);
        setPfpUrl(null);

        // resolve the ens or address
        resolveAddress(urlInput);
    }, [urlInput, routerLocation.key])

    /* 
     * Fetch profile and posts when address is set.
     */
    useEffect(() => {
        // do nothing if address is null or undefined
        if (address === null || address === undefined) {
            return;
        }

        // show invalid profile if address cannot be normalized to checksum
        try {
            if (!address.endsWith(".eth")) {
                ethersUtils.getAddress(address);
            }
        }
        catch (error) {
            console.error(error);
            setProfileInvalid(true);
            setProfileDataLoading(false);
            setPostsLoading(false);
            return;
        }

        // address is valid, fetch profile and posts
        fetchProfile();
        fetchPosts();

    }, [address])
        
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
        <>
            {profileInvalid === true
                ? <ProfileInvalid address={address} /> 
                : <Container className="justify-content-center">

                    {/* show placeholder or profile data */}
                    {profileDataLoading === true
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
                                        <h5>
                                            <ProfileEnsAndAddress
                                                address={address}
                                            />
                                        </h5>
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
                    {postsLoading === true
                        ? <PostsPlaceholder />
                        : postsError === true
                            ? <PostsError retryAction={fetchPosts} />
                            : posts.length === 0
                                ? <PostsNotFound retryAction={fetchPosts} />
                                : posts.map(post => (
                                    <Post
                                        key={post.id}
                                        author={post.author}
                                        text={post.text}
                                        imgUrl={post.imgUrl}
                                        created={post.created}
                                        pfp={pfpUrl}
                                        refTx={post.refTx}
                                        profileAddress={address}
                                    />
                    ))}

                </Container>
            }
        </>
    )
}

export default Profile
