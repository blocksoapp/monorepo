import React, { useState, useEffect } from 'react'
import { Col, Container, Row } from "react-bootstrap";
import { apiGetFeeds } from '../../api'
import FeedThumbnail from "./FeedThumbnail";
import FeedsPlaceholder from "./FeedsPlaceholder";
import FeedError from "./FeedError";
import PaginateButton from "../ui/PaginateButton";


function NewestFeeds() {
    // constants

    // state
    const [feeds, setFeeds] = useState([]);
    const [feedsNextPage, setFeedsNextPage] = useState(null);
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
            setFeedsNextPage(data["next"]);
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
            setFeedsNextPage(null);
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
                :   <Container>
                        <Row>
                            {feeds && feeds.map(feed => (
                                <Col key={feed.id} xs={12} md={6}>
                                    <FeedThumbnail
                                        key={feed.id}
                                        data={feed}
                                    />
                                </Col>
                            ))}
                        </Row>
                    </Container>
        }

        {/* Paginate Button */}
        <Row className="justify-content-center mb-3">
            <Col className="col-auto">
                <PaginateButton
                    url={feedsNextPage}
                    items={feeds}
                    callback={setFeeds}
                    text="Show More"
                    variant="outline-primary"
                />
            </Col>
        </Row>

    </Container>
  )
}

export default NewestFeeds;
