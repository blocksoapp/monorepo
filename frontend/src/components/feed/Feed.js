import React, { useState, useEffect } from 'react'
import { useLocation } from "react-router-dom";
import { Container } from "react-bootstrap"
import { apiGetFeed, apiGetUrl } from '../../api';
import NewPost from '../posts/NewPost.js';
import Post from '../posts/Post.js'; 
import PostsError from '../posts/PostsError';
import PostsPlaceholder from '../posts/PostsPlaceholder';
import MoreFeedItems from './MoreFeedItems';
import FeedError from './FeedError';
import PollNewItems from './PollNewItems';


function Feed({ profileData }) {

    // constants
    const routerLocation = useLocation();

    // state
    const [loadingFeedItems, setLoadingFeedItems] = useState(true);
    const [feedItemsError, setFeedItemsError] = useState(false);
    const [feedItemsNextPage, setFeedItemsNextPage] = useState(null);
    const [feedItems, setFeedItems] = useState(null);
    const [moreFeedItemsLoading, setMoreFeedItemsLoading] = useState(false);
    const [moreFeedItemsError, setMorePostsError] = useState(false);

    // functions
    const submitPostCallback = (newPost) => {
        setFeedItems([newPost].concat(feedItems));
    }

    const fetchFeed = async () => {
        setLoadingFeedItems(true);
        const res = await apiGetFeed();

        // success handling
        if (res.status === 200) {
            var data = await res.json();
            setFeedItems(data["results"]);
            setFeedItemsError(false);
            setLoadingFeedItems(false);
            setFeedItemsNextPage(data["next"]);
        }
        // error handling
        else {
            setFeedItemsError(true);
            setLoadingFeedItems(false);
            console.error(res);
        }
    }

    const fetchMoreFeedItems = async () => {
        setMoreFeedItemsLoading(true);
        const resp = await apiGetUrl(feedItemsNextPage);

        // success
        if (resp.status === 200) {
            var data = await resp.json();
            setFeedItems(feedItems.concat(data["results"]));
            setMorePostsError(false);
            setMoreFeedItemsLoading(false);
            setFeedItemsNextPage(data["next"]);
        }
        // error
        else {
            setMorePostsError(true);
            setMoreFeedItemsLoading(false);
            console.error(resp);
        }
    }


    /* 
     * Fetch feed items when user navigates to Home page.
     */
    useEffect(() => {
        // reset the current profile state
        setLoadingFeedItems(true);
        setFeedItems([]);
        setFeedItemsError(false);
        setMorePostsError(false);
        setMoreFeedItemsLoading(false);
        setFeedItemsNextPage(null);

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

            {/* Poll for new feed items in background */}
            <PollNewItems
                interval={30000}  // 30 seconds
                apiFunction={apiGetFeed}
                oldItems={feedItems}
                callback={fetchFeed}
            />

            {/* Feed or Placeholder */}
            {loadingFeedItems === true
            ? <PostsPlaceholder />
            : feedItemsError === true
                ? <FeedError retryAction={fetchFeed} />
                : <Container>
                    {feedItems && feedItems.map(post => (
                        <Post key={post.id} data={post} />
                    ))}
                </Container>
            }

            {/* More Feed Items Link (pagination) */}
            {feedItemsNextPage === null
                ? <></>
                : moreFeedItemsLoading === true
                    ? <PostsPlaceholder />
                    : moreFeedItemsError === true
                        ? <PostsError retryAction={fetchMoreFeedItems} />
                        : <MoreFeedItems action={fetchMoreFeedItems} />
            }

        </Container>
    )
}

export default Feed;
