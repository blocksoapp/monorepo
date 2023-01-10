import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Container } from "react-bootstrap"
import { apiGetMyFeed, apiGetUrl } from '../../api';
import { usePageBottom } from '../../hooks/usePageBottom';
import NewPost from '../posts/NewPost.js';
import Post from '../posts/Post.js'; 
import PostsError from '../posts/PostsError';
import PostsPlaceholder from '../posts/PostsPlaceholder';
import FeedError from './FeedError';
import PollNewItems from './PollNewItems';


function MyFeed({ profileData }) {
  // constants
  const routerLocation = useLocation();
  const reachedPageBottom = usePageBottom();

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
  };

  const fetchFeed = async () => {
    setLoadingFeedItems(true);
    const res = await apiGetMyFeed();

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
  };

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
  };

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
  }, [routerLocation.key]);

  /*
   * Paginate once user scrolls to bottom.
   */
  useEffect(() => {
    if (!reachedPageBottom) return
    if (!feedItemsNextPage) return

    // paginate the feed items
    fetchMoreFeedItems();
  }, [reachedPageBottom]);


    return (
        <Container>

            {/* Poll for new feed items in background */}
            <PollNewItems
                interval={30000}  // 30 seconds
                apiFunction={apiGetMyFeed}
                apiFunctionArgs={[]}
                oldItems={feedItems}
                callback={fetchFeed}
                text="There are new items in your feed!"
            />

            {/* New Post Form */}
            <NewPost
                profileData={profileData}
                submitPostCallback={submitPostCallback}
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

            {/* Pagination loading placeholder or error*/}
            {feedItemsNextPage === null || loadingFeedItems
                ? <></>
                : moreFeedItemsLoading === true
                    ? <PostsPlaceholder />
                    : moreFeedItemsError === true
                        ? <PostsError retryAction={fetchMoreFeedItems} />
                        : <></>
            }

        </Container>
    );
}

export default MyFeed;
