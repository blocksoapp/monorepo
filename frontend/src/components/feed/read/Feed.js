import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Col, Container, Row } from "react-bootstrap"
import { apiGetFeedItems, apiGetUrl } from '../../../api';
import PaginateButton from '../../ui/PaginateButton';
import PaginateScroll from '../../ui/PaginateScroll';
import NewPost from '../../posts/NewPost.js';
import Post from '../../posts/Post.js'; 
import PostsError from '../../posts/PostsError';
import PostsPlaceholder from '../../posts/PostsPlaceholder';
import MoreFeedItems from './MoreFeedItems';
import FeedError from './FeedError';
import PollNewItems from './PollNewItems';
import NoFeedItems from './NoFeedItems';


function Feed({ id, name, paginateByButton }) {
  // constants

  // state
  const [loadingFeedItems, setLoadingFeedItems] = useState(true);
  const [feedItemsError, setFeedItemsError] = useState(false);
  const [feedItemsNextPage, setFeedItemsNextPage] = useState(null);
  const [feedItems, setFeedItems] = useState(null);
  const [moreFeedItemsLoading, setMoreFeedItemsLoading] = useState(false);
  const [moreFeedItemsError, setMorePostsError] = useState(false);

  // functions

  const fetchFeed = async () => {
    setLoadingFeedItems(true);

    // get feed items
    const resp = await apiGetFeedItems(id);

    // success handling
    if (resp.status === 200) {
      var data = await resp.json();
      setFeedItems(data["results"]);
      setFeedItemsError(false);
      setLoadingFeedItems(false);
      setFeedItemsNextPage(data["next"]);
    }
    // error handling
    else {
      setFeedItemsError(true);
      setLoadingFeedItems(false);
      console.error(resp);
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
  }, [id]);

    return (
        <Container>

            {/* Poll for new feed items in background */}
            <PollNewItems
                interval={30000}  // 30 seconds
                apiFunction={apiGetFeedItems}
                apiFunctionArgs={[id]}
                oldItems={feedItems}
                callback={fetchFeed}
                text="There are new items in the feed!"
            />

            {/* Feed or Placeholder */}
            {loadingFeedItems === true
            ? <PostsPlaceholder />
            : feedItemsError === true
                ? <FeedError retryAction={fetchFeed} />
                : feedItems.length === 0
                    ? <NoFeedItems feedId={id} />
                    : <Container className="py-4">
                        {feedItems.map(post => (
                            <Post key={post.id} data={post} />
                        ))}
                      </Container>
            }

            {/* More Feed Items Link (pagination) */}
            <Row className="justify-content-center">
                <Col className="col-auto">
                    {paginateByButton
                        ?   <PaginateButton
                                url={feedItemsNextPage}
                                items={feedItems}
                                callback={setFeedItems}
                                text="Load More"
                                variant="outline-primary"
                            />
                        :   <PaginateScroll
                                url={feedItemsNextPage}
                                items={feedItems}
                                callback={setFeedItems}
                            />
                    }
                </Col>
            </Row>

        </Container>
    );
}

export default Feed;
