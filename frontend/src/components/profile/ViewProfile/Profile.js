import React, { useState, useEffect, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom';
import { useLocation, useParams } from "react-router-dom";
import { Badge, Button, Col, Container, Image, Row } from 'react-bootstrap'
import { useAccount, useEnsAddress, useEnsAvatar, useEnsName } from 'wagmi'
import { utils as ethersUtils } from 'ethers';
import {
    apiGetPosts, apiGetProfile, apiPostFollow, apiPostUnfollow, apiGetUrl
} from '../../../api';
import { UserContext } from '../../../contexts/UserContext';
import Post from '../../posts/Post.js'; 
import PostsPlaceholder from '../../posts/PostsPlaceholder';
import PostsError from '../../posts/PostsError';
import PostsNotFound from '../../posts/PostsNotFound';
import MorePosts from "../../posts/MorePosts";
import ProfilePlaceholder from './ProfilePlaceholder';
import ProfileInvalid from './ProfileInvalid';
import ProfileEnsAndAddress from './ProfileEnsAndAddress';
import PfpResolver from '../../PfpResolver';

function Profile(props) {
    // constants
    const { user } = useContext(UserContext)
    const navigate = useNavigate()

    // state
    const [profileDataLoading, setProfileDataLoading] = useState(true);
    const [profileData, setProfileData] = useState({});
    const [postsLoading, setPostsLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [postsError, setPostsError] = useState(false);
    const [activeLeftTab, setActiveLeftTab] = useState('first')
    const [postsNextPage, setPostsNextPage] = useState(null);
    const [morePostsLoading, setMorePostsLoading] = useState(false);
    const [morePostsError, setMorePostsError] = useState(false);
 
    // functions
    const fetchPosts = async () => {
        setPostsLoading(true);
        const res = await apiGetPosts(props.address);

        if (res.status === 200) {
            var data = await res.json();
            setPosts(data["results"]);
            setPostsError(false);
            setPostsLoading(false);
            setPostsNextPage(data["next"]);
        }
        else {
            setPostsError(true);
            setPostsLoading(false);
            console.error(res);
        }
    }

    const fetchMorePosts = async () => {
        setMorePostsLoading(true);
        const resp = await apiGetUrl(postsNextPage);

        // success
        if (resp.status === 200) {
            var data = await resp.json();
            setPosts(posts.concat(data["results"]));
            setMorePostsError(false);
            setMorePostsLoading(false);
            setPostsNextPage(data["next"]);
        }
        // error
        else {
            setMorePostsError(true);
            setMorePostsLoading(false);
            console.error(resp);
        }
    }

    const fetchProfile = async () => {
        const res = await apiGetProfile(props.address)
        setProfileDataLoading(true);
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
        const res = await apiPostUnfollow(props.address)
        if (res.ok) {
            setProfileData({
                ...profileData,
                numFollowers: profileData["numFollowers"] - 1,
                followedByMe: false
            });
        }
    }

    const handleFollow = async () => {
        const res = await apiPostFollow(props.address)
        if (res.ok) {
            setProfileData({
                ...profileData,
                numFollowers: profileData["numFollowers"] + 1,
                followedByMe: true
            });
        }
    }
    
        // Navigate to user's followers
        const handleFollowerClick = () => {
            navigate(`/${props.address}/profile/follow`, { state: { activeLeftTab: 'first' } })
        }

        const handleFollowingClick = () => {
            navigate(`/${props.address}/profile/follow`, { state: { activeLeftTab: 'second' } })
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

        // reset the current profile state
        setProfileDataLoading(true);
        setProfileData({});
        setPostsLoading(true);
        setPosts([]);
        setPostsError(false);
        setMorePostsError(false);
        setMorePostsLoading(false);
        setPostsNextPage(null);

        // load the new profile and its posts
        fetchProfile();
        fetchPosts();

    }, [props.address])


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
                                <PfpResolver
                                    address={props.address}
                                    imgUrl={profileData["image"]}
                                    height="256px"
                                    width="256px"
                                    fontSize="1.75rem"
                                />
                            </Col>
                        </Row>

                        {/* Address and ENS */}
                        <Row className="justify-content-center mt-4">
                            <Col className="col-auto text-center">
                                <h4>
                                    <ProfileEnsAndAddress
                                        address={props.address}
                                    />
                                </h4>
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
                                            <Badge bg="secondary" className="pointer light-hover " onClick={handleFollowerClick}>
                                            
                                                {profileData["numFollowers"]}
                                                {profileData["numFollowers"] === 1 ?
                                                    " Follower" : " Followers"}
                                            </Badge> 
                                    </h5>
                                </Col>
                                <Col className="col-auto">
                                    <h5>   
                                            <Badge bg="secondary" className="pointer" onClick={handleFollowingClick}>
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
                            <Post key={post.id} data={post} />
            ))}

            {/* More Posts Link (pagination) */}
            {postsNextPage === null
                ? <></>
                : morePostsLoading === true
                    ? <PostsPlaceholder />
                    : morePostsError === true
                        ? <PostsError retryAction={fetchMorePosts} />
                        : <MorePosts action={fetchMorePosts} />
            }

        </>
    )
}

export default Profile
