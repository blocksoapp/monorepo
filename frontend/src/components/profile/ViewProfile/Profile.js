import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLocation, useParams } from "react-router-dom";
import { Badge, Button, Col, Container, Image, Row } from "react-bootstrap";
import { useAccount, useEnsAddress, useEnsAvatar, useEnsName } from "wagmi";
import { utils as ethersUtils } from "ethers";
import {
  apiGetPosts,
  apiGetProfile,
  apiPostFollow,
  apiPostUnfollow,
  apiGetUrl,
} from "../../../api";
import { UserContext } from "../../../contexts/UserContext";
import { usePageBottom } from "../../../hooks/usePageBottom";
import NewPost from "../../posts/NewPost.js";
import Post from "../../posts/Post.js";
import PostsPlaceholder from "../../posts/PostsPlaceholder";
import PostsError from "../../posts/PostsError";
import PostsNotFound from "../../posts/PostsNotFound";
import PostsFetching from "../../posts/PostsFetching";
import ProfilePlaceholder from "./ProfilePlaceholder";
import ProfileInvalid from "./ProfileInvalid";
import ProfileEnsAndAddress from "./ProfileEnsAndAddress";
import PfpResolver from "../../PfpResolver";
import PollNewItems from "../../feed/read/PollNewItems";
import ProfileOptions from "./ProfileOptions";

function Profile(props) {
  // constants
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const reachedPageBottom = usePageBottom();

  // state
  const [profileDataLoading, setProfileDataLoading] = useState(true);
  const [profileData, setProfileData] = useState({});
  const [postsLoading, setPostsLoading] = useState(true);
  const [posts, setPosts] = useState(null);
  const [postsError, setPostsError] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState("first");
  const [postsNextPage, setPostsNextPage] = useState(null);
  const [morePostsLoading, setMorePostsLoading] = useState(false);
  const [morePostsError, setMorePostsError] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // functions
  const fetchPosts = async () => {
    setPostsLoading(true);
    const res = await apiGetPosts(props.address);

    if (res.status === 200) {
      var data = await res.json();
      setPosts(data["results"]);
      setPostsError(false);
      setPostsNextPage(data["next"]);
      setPostsLoading(false);
    } else {
      setPostsError(true);
      setPostsLoading(false);
      console.error(res);
    }
  };

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
  };

  const fetchProfile = async () => {
    const res = await apiGetProfile(props.address);
    setProfileDataLoading(true);
    if (res.status === 200) {
      var data = await res.json();
      setProfileData(data);
      setProfileDataLoading(false);
    } else {
      console.error(res);
      setProfileDataLoading(false);
    }
  };

  const handleUnfollow = async () => {
    setFollowLoading(true);

    const res = await apiPostUnfollow(props.address);
    if (res.ok) {
      setProfileData({
        ...profileData,
        numFollowers: profileData["numFollowers"] - 1,
        followedByMe: false,
      });
    }

    setFollowLoading(false);
  };

  const handleFollow = async () => {
    setFollowLoading(true);

    const res = await apiPostFollow(props.address);
    if (res.ok) {
      setProfileData({
        ...profileData,
        numFollowers: profileData["numFollowers"] + 1,
        followedByMe: true,
      });
    }

    setFollowLoading(false);
  };

  // Navigate to user's followers
  const handleFollowerClick = () => {
    navigate(`/${props.address}/profile/follow`, {
      state: { activeLeftTab: "first" },
    });
  };

  const handleFollowingClick = () => {
    navigate(`/${props.address}/profile/follow`, {
      state: { activeLeftTab: "second" },
    });
  };

  // effects

  /*
   * Fetch profile and posts when address is set.
   */
  useEffect(() => {
    // do nothing if address is null or undefined
    if (!props.address) {
      return;
    }

    // load the new profile and its posts
    fetchProfile();
    fetchPosts();

    // clean up on unmount of effect
    return () => {
      // reset the current profile state
      setProfileDataLoading(true);
      setProfileData({});
      setPostsLoading(true);
      setPosts(null);
      setPostsError(false);
      setMorePostsError(false);
      setMorePostsLoading(false);
      setPostsNextPage(null);
      setFollowLoading(false);
    };
  }, [props.address]);

  /*
   * If a user has no posts, keep polling for new posts
   * every 6 seconds.
   */
  useEffect(() => {
    // poll every 5 seconds if user does not have posts
    if (posts !== null && posts.length === 0) {
      const timeout = setTimeout(() => {
        fetchPosts();
      }, 6000);
      return;
    }
  }, [posts]);

  /*
   * Paginate once user scrolls to bottom.
   */
  useEffect(() => {
    if (!reachedPageBottom) return;
    if (!postsNextPage) return;

    // paginate the profile's posts
    fetchMorePosts();
  }, [reachedPageBottom]);

  return (
    <>
      {/* show placeholder or profile data */}
      {profileDataLoading === true ? (
        <Container className="justify-content-center">
          <ProfilePlaceholder />
        </Container>
      ) : (
        <Container fluid>
          {/* Poll for new posts in background */}
          {posts && posts.length > 0 && (
            <PollNewItems
              interval={30000} // 30 seconds
              apiFunction={apiGetPosts}
              apiFunctionArgs={[props.address]}
              oldItems={posts}
              callback={fetchPosts}
              text="New posts available!"
            />
          )}

          {/* User Info Section */}
          <Container className="border-bottom border-light">
            {/* Profile picture */}
            <Row className="justify-content-center">
              <Col className="col-auto pe-0">
                <PfpResolver
                  address={props.address}
                  imgUrl={profileData["image"]}
                  height="133.5px"
                  width="133.5px"
                  fontSize="1.75rem"
                />
              </Col>
              <Col className="col-auto ps-0">
                <ProfileOptions profile={profileData} />
              </Col>
            </Row>

            {/* Address and ENS */}
            <Row className="justify-content-center mt-4">
              <Col className="col-auto text-center">
                <h4>
                  <ProfileEnsAndAddress address={props.address} />
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
                  <Badge
                    bg="secondary"
                    className="pointer light-hover "
                    onClick={handleFollowerClick}
                  >
                    {profileData["numFollowers"]}
                    {profileData["numFollowers"] === 1
                      ? " Follower"
                      : " Followers"}
                  </Badge>
                </h5>
              </Col>
              <Col className="col-auto">
                <h5>
                  <Badge
                    bg="secondary"
                    className="pointer"
                    onClick={handleFollowingClick}
                  >
                    {profileData["numFollowing"]} Following
                  </Badge>
                </h5>
              </Col>
              <Col className="col-auto">
                {user !== null && profileData["followedByMe"] === true ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleUnfollow}
                    disabled={
                      (user !== null && user["address"] === props.address) ||
                      followLoading
                        ? true
                        : false
                    }
                  >
                    Unfollow
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleFollow}
                    disabled={
                      (user !== null && user["address"] === props.address) ||
                      followLoading
                        ? true
                        : false
                    }
                  >
                    Follow
                  </Button>
                )}
              </Col>
            </Row>
          </Container>
        </Container>
      )}

      <Container>
        {/* New Post if profile is the current user */}
        {user !== null && user["address"] === props.address && (
          <NewPost
            padding="p-0"
            submitPostCallback={(post) => setPosts([post, ...posts])}
          />
        )}

        {/* Posts Section -- show placeholder or posts */}
        {postsLoading === true ? (
          <PostsPlaceholder />
        ) : postsError === true ? (
          <PostsError retryAction={fetchPosts} />
        ) : posts && posts.length === 0 && profileData.lastLogin !== null ? (
          <PostsNotFound retryAction={fetchPosts} />
        ) : (
          posts.map((post) => <Post key={post.id} data={post} />)
        )}

        {/* Paginate through posts when user scrolls to the end */}
        {postsNextPage === null ? (
          <></>
        ) : morePostsLoading === true ? (
          <PostsPlaceholder />
        ) : morePostsError === true ? (
          <PostsError retryAction={fetchMorePosts} />
        ) : (
          <></>
        )}
      </Container>
    </>
  );
}

export default Profile;
