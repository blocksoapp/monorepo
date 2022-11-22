import React, { useState, useEffect } from 'react'
import { useLocation } from "react-router-dom";
import { Container } from "react-bootstrap"
import { apiGetFeed, apiGetUrl } from '../../api';
import NewPost from '../posts/NewPost.js';
import Post from '../posts/Post.js'; 
import PostsError from '../posts/PostsError';
import PostsPlaceholder from '../posts/PostsPlaceholder';
import MorePosts from '../posts/MorePosts';
import FeedError from './FeedError';


function Feed({ profileData }) {

    // constants
    const routerLocation = useLocation();

    // state
    const [loadingFeed, setLoadingFeed] = useState(true);
    const [feedError, setFeedError] = useState(false);
    const [feedNextPage, setFeedNextPage] = useState(null);
    const [posts, setPosts] = useState(null);
    const [morePostsLoading, setMorePostsLoading] = useState(false);
    const [morePostsError, setMorePostsError] = useState(false);

    // functions
    const submitPostCallback = (newPost) => {
        setPosts([newPost].concat(posts));
    }

    const fetchFeed = async () => {
        setLoadingFeed(true);
        const res = await apiGetFeed();

        // success handling
        if (res.status === 200) {
            var data = await res.json();
            setPosts(data["results"]);
            setFeedError(false);
            setLoadingFeed(false);
            setFeedNextPage(data["next"]);
        }
        // error handling
        else {
            setFeedError(true);
            setLoadingFeed(false);
            console.error(res);
        }
    }

    const fetchMoreFeedItems = async () => {
        setMorePostsLoading(true);
        const resp = await apiGetUrl(feedNextPage);

        // success
        if (resp.status === 200) {
            var data = await resp.json();
            setPosts(posts.concat(data["results"]));
            setMorePostsError(false);
            setMorePostsLoading(false);
            setFeedNextPage(data["next"]);
        }
        // error
        else {
            setMorePostsError(true);
            setMorePostsLoading(false);
            console.error(resp);
        }
    }


    /* 
     * Fetch feed items when user navigates to Home page.
     */
    useEffect(() => {
        // reset the current profile state
        setLoadingFeed(true);
        setPosts([]);
        setFeedError(false);
        setMorePostsError(false);
        setMorePostsLoading(false);
        setFeedNextPage(null);

        // load the new feed items
        fetchFeed();

    }, [routerLocation.key])


    return (
        <Container>

            {/* New Post Form */}
            <NewPost
                profileData={profileData}
                submitPostCallback={submitPostCallback}
            />

            {/* Feed or Placeholder */}
            {loadingFeed === true
            ? <PostsPlaceholder />
            : feedError === true
                ? <FeedError retryAction={fetchFeed} />
                : <Container>
                    {posts && posts.map(post => (
                        <Post
                            key={post.id}
                            id={post.id}
                            author={post.author.address}
                            text={post.text}
                            pfp={post.author.image}
                            imgUrl={post.imgUrl}
                            created={post.created}
                            refTx={post.refTx}
                            numComments={post.numComments}
                            profileAddress={profileData['address']}
                        />
                    ))}
                </Container>
            }

            {/* More Feed Items Link (pagination) */}
            {feedNextPage === null
                ? <></>
                : morePostsLoading === true
                    ? <PostsPlaceholder />
                    : morePostsError === true
                        ? <PostsError retryAction={fetchMoreFeedItems} />
                        : <MorePosts action={fetchMoreFeedItems} />
            }

        </Container>
    )
}

export default Feed;
