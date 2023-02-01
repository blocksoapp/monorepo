import { Col, Container, Button, Row } from "react-bootstrap";
import CreateFeedButton from "../components/feed/CreateFeedButton";
import FeedsFollowedByMe from "../components/feed/FeedsFollowedByMe";
import NewestFeeds from "../components/feed/NewestFeeds";


function Feeds() {

    return (
        <Container>
            <Row>
                <CreateFeedButton />
            </Row>
            <Row>
                <h3 className="display-6 mt-3 mb-5 text-center text-muted">Feeds I Follow</h3>
                <FeedsFollowedByMe />
            </Row>
            <Row>
                <h3 className="display-6 my-5 text-center text-muted">Newest Feeds</h3>
                <NewestFeeds />
            </Row>
        </Container>
    )
}


export default Feeds;
