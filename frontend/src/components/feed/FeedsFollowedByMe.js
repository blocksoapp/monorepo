import { useContext, useState, useEffect } from 'react'
import { Col, Container, Row } from "react-bootstrap";
import { ConnectKitButton, SIWEButton } from "connectkit";
import { apiGetFeedsFollowedByMe } from '../../api'
import { UserContext } from "../../contexts/UserContext";
import FeedThumbnail from "./FeedThumbnail";
import FeedsPlaceholder from "./FeedsPlaceholder";
import FeedError from "./FeedError";
import PaginateButton from "../ui/PaginateButton";


function FeedsFollowedByMe() {
    // hooks
    const { user } = useContext(UserContext);

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
    }, [])
    

  return (
    <Container>
        {feedsLoading
            ? <FeedsPlaceholder />
            : user === null
                ?   <Row className="justify-content-center text-center">
                        <p className="text-muted">You are not signed in.</p>
                        <ConnectKitButton label="Sign In">
                            <SIWEButton />
                        </ConnectKitButton>
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
