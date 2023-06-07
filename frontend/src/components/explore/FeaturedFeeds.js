import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Col, Container, Row } from "react-bootstrap";
import FeedThumbnail from "../feed/read/FeedThumbnail.js";

function FeaturedFeeds({ feeds }) {
  // hooks
  const navigate = useNavigate();

  // render
  return (
    <Container>
      <Row>
        {feeds.map((feed) => (
          <Col xs={12} md={6}>
            <FeedThumbnail key={feed.id} data={feed} />
          </Col>
        ))}
      </Row>
      <Row className="justify-content-center">
        <Col className="col-auto">
          <Button
            className="my-4"
            variant="outline-primary"
            size="lg"
            onClick={() => navigate("/feeds")}
          >
            View All
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

export default FeaturedFeeds;
