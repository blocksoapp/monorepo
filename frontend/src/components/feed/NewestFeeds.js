import React, { useState, useEffect } from 'react'
import { Col, Container, Row } from "react-bootstrap";
import { apiGetFeeds } from '../../api'
import FeedThumbnail from "./FeedThumbnail";
import FeedsPlaceholder from "./FeedsPlaceholder";
import FeedError from "./FeedError";


function NewestFeeds() {
    // constants

    // state
    const [feeds, setFeeds] = useState([]);
    const [feedsLoading, setFeedsLoading] = useState(true);
    const [feedsError, setFeedsError] = useState(false);

    // functions

    /*
     * Gets all the API data for the feeds the user follows.
     */
    const fetchFeeds = async () => {
        const resp = await apiGetFeeds();
        if (resp.ok) {
            const data = await resp.json();
            setFeeds(data["results"]);
            setFeedsLoading(false);
            setFeedsError(false);
        }
        else {
            console.error(resp);
            setFeedsError(true);
            setFeedsLoading(false);
        }
    }

    // effects

    /*
     * Called on component mount.
     * Gets all the API data for the feeds the user follows.
     */
    useEffect(() => {
        fetchFeeds();

        // clean up on component unmount
        return () => {
            setFeeds([]);
            setFeedsLoading(true);
            setFeedsError(false);
        }
    }, [])


  return (
    <Container>
        {feedsLoading
            ? <FeedsPlaceholder />
            : feedsError
                ? <FeedError retryAction={fetchFeeds} />
                :   <Row>
                        {feeds && feeds.map(feed => (
                            <Col sm={6} key={feed.id}>
                                <FeedThumbnail
                                    key={feed.id}
                                    data={feed}
                                />
                            </Col>
                        ))}
                    </Row>
        }
    </Container>
  )
}

export default NewestFeeds;
