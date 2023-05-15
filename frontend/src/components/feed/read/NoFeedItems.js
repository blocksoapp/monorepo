import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Col, Container, Row } from "react-bootstrap";
import { UserContext } from "../../../contexts/UserContext";

function NoFeedItems({ feedId }) {
  // hooks
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  // render
  return (
    <Container>
      <Row className="justify-content-center align-items-center">
        <Col xs={12}>
          {/* If the user is logged in, show the edit feed button */}
          {user !== null ? (
            <Alert variant="warning">
              <Row className="align-items-center">
                <Col>
                  <p className="mb-0">
                    Click "Edit Feed" to add users to the feed.
                  </p>
                </Col>
                <Col className="col-auto">
                  <Button
                    variant="outline-primary"
                    onClick={() => navigate(`/feeds/${feedId}/edit`)}
                  >
                    Edit Feed
                  </Button>
                </Col>
              </Row>
            </Alert>
          ) : (
            <Alert variant="warning" className="pb-0">
              <Row className="align-items-center">
                <Col>
                  <p>The feed owner hasn't followed anyone yet.</p>
                </Col>
              </Row>
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default NoFeedItems;
