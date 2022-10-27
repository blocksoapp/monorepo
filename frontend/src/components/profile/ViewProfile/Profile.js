import React, { useState, useEffect, useContext } from 'react'
import { useLocation, useParams } from "react-router-dom";
import { Badge, Button, Col, Container, Image, Row } from 'react-bootstrap'
import { useAccount, useEnsAddress, useEnsAvatar, useEnsName } from 'wagmi'
import { utils as ethersUtils } from 'ethers';
import Post from '../../posts/Post.js'; 
import { baseAPI, getCookie } from '../../../utils.js'
import { apiGetPosts } from '../../../api';
import PostsPlaceholder from '../../posts/PostsPlaceholder';
import PostsError from '../../posts/PostsError';
import PostsNotFound from '../../posts/PostsNotFound';
import ProfilePlaceholder from './ProfilePlaceholder';
import ProfileInvalid from './ProfileInvalid';
import ProfileEnsAndAddress from './ProfileEnsAndAddress';
import Pfp from '../../Pfp';
import { UserContext } from '../../../contexts/UserContext'


function Profile(props) {
    // constants
    const ensAvatar = useEnsAvatar({addressOrName: props.address});
    const { user } = useContext(UserContext)

    // state
    const [profileDataLoading, setProfileDataLoading] = useState(true);
    const [profileData, setProfileData] = useState({});
    const [postsLoading, setPostsLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [postsError, setPostsError] = useState(false);
    const [pfpUrl, setPfpUrl] = useState(null);
 
    // functions

    const fetchPosts = async () => {
        setPostsLoading(true);
        const res = await apiGetPosts(props.address);

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
        const url = `${baseAPI}/${props.address}/profile/`;
        setProfileDataLoading(true);
        const res = await fetch(url, {
            method: 'GET',
            credentials: 'include'
        });
        if (res.status === 200) {
            var data = await res.json();
            setProfileData(data);
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
        const url = `${baseAPI}/${props.address}/follow/`;
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
        const url = `${baseAPI}/${props.address}/follow/`;
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
     * Fetch profile and posts when address is set.
     */
    useEffect(() => {
        // do nothing if address is null or undefined
        if (!props.address) {
            return;
        }

        fetchProfile();
        fetchPosts();

    }, [props.address])


    /*
     * Set profile picture if user has uploaded one.
     */
    useEffect(() => {
        if ("image" in profileData && profileData["image"] !== "") {
            setPfpUrl(profileData["image"]);
        }
    }, [profileData])


    /*
     * Set pfp url to the ens avatar if the user does
     * not have a profile pic and does have an ens avatar.
     */
    useEffect(() => {
        if (!pfpUrl && !ensAvatar.isLoading && ensAvatar.data !== null) {
            setPfpUrl(ensAvatar.data);
        }
    }, [ensAvatar])


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
            {/* show placeholder or profile data */}
            {profileDataLoading === true
                ? <Container className="justify-content-center"><ProfilePlaceholder /></Container>
                : <Container fluid>

                    {/* User Info Section */}
                    <Container className="border-bottom border-light">

                        {/* Profile picture */}
                        <Row className="justify-content-center">
                            <Col className="col-auto">
                                <Pfp
                                    height="256px"
                                    width="256px"
                                    imgUrl={pfpUrl}
                                    address={props.address}
                                    ensName={props.ensName}
                                    fontSize="1.75rem"
                                />
                            </Col>
                        </Row>

                        {/* Address and ENS */}
                        <Row className="justify-content-center mt-2">
                            <Col className="col-auto text-center">
                                <h5>
                                    <ProfileEnsAndAddress
                                        address={props.address}
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
                                        disabled={user !== null && user["address"] === props.address ? true : false}
                                      >
                                        Unfollow
                                      </Button> 
                                    : <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={handleFollow}
                                        disabled={user !== null && user["address"] === props.address ? true : false}
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
                                id={post.id}
                                author={post.author}
                                ensName={props.ensName}
                                text={post.text}
                                imgUrl={post.imgUrl}
                                created={post.created}
                                pfp={post.pfp}
                                refTx={post.refTx}
                                numComments={post.numComments}
                                profileAddress={props.address}
                            />
            ))}
        </>
    )
}

export default Profile
