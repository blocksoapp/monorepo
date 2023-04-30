import { Col, Container, Button, Row } from "react-bootstrap";
import CreateFeedButton from "../components/feed/write/CreateFeedButton";
import FeedsFollowedByMe from "../components/feed/read/FeedsFollowedByMe";
import NewestFeeds from "../components/feed/read/NewestFeeds";
import MainHeader from "../components/ui/MainHeader";

function Feeds() {
  return (
    <Container>
      <MainHeader header="Feeds" />
      <Row>
        <CreateFeedButton />
      </Row>
      <Row>
        <h3 className="display-6 mt-3 mb-5 text-muted">Feeds I Follow</h3>
        <FeedsFollowedByMe />
      </Row>
      <Row>
        <h3 className="display-6 my-5 text-muted">Newest Feeds</h3>
        <NewestFeeds />
      </Row>
    </Container>
  );
}

export default Feeds;
