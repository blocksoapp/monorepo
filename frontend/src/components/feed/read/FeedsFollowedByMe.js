import { useContext, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom';
import { Col, Container, Row } from "react-bootstrap";
import { ConnectButton } from '@nullbitx8/rainbowkit';
import { apiGetFeedsFollowedByMe } from '../../../api'
import { useUser } from "../../../hooks/useUser";
import PaginateButton from "../../ui/PaginateButton";
import FeedThumbnail from "./FeedThumbnail";
import FeedsPlaceholder from "./FeedsPlaceholder";
import FeedError from "./FeedError";


function FeedsFollowedByMe() {
    // hooks
    const { user } = useUser();
    const routerLocation = useLocation();

    // state
    const [feeds, setFeeds] = useState([]);
    const [feedsNextPage, setFeedsNextPage] = useState(null);
    const [feedsLoading, setFeedsLoading] = useState(true);
    const [feedsError, setFeedsError] = useState(false);

    // functions

    /*
     * Gets all the API data for the feeds the user follows.
     */
    const fetchFeedsFollowedByMe = async () => {
        const resp = await apiGetFeedsFollowedByMe();
        if (resp.ok) {
            const data = await resp.json();
            setFeeds(data["results"]);
            setFeedsNextPage(data["next"]);
            setFeedsLoading(false);
            setFeedsError(false);
        }
        else if (resp.status === 403) {
            setFeedsLoading(false);
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
        fetchFeedsFollowedByMe();

        // clean up on component unmount
        return () => {
            setFeeds([]);
            setFeedsNextPage(null);
            setFeedsLoading(true);
            setFeedsError(false);
        }
    }, [routerLocation.key])
    

  return (
    <Container>
        {feedsLoading
            ? <FeedsPlaceholder />
            : user === null
                ?   <Row className="justify-content-center text-center">
                        <p className="text-muted">You are not signed in.</p>
                        <ConnectButton />
                    </Row>
                : feedsError
                    ? <FeedError retryAction={fetchFeedsFollowedByMe} />
                    :   <Container>
                            <Row>
                                {feeds
                                    ? feeds.length === 0
                                        ?   <Col className="text-center">
                                                <p className="text-muted">You are not following any feeds.</p>
                                            </Col>
                                        : feeds.map(feed => (
                                            <Col xs={12} md={6} key={feed.id}>
                                                <FeedThumbnail
                                                    key={feed.id}
                                                    data={feed}
                                                />
                                            </Col>
                                        ))
                                    : <></>
                                }
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

export default FeedsFollowedByMe;
