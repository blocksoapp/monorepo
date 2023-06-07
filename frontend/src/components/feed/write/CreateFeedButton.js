import { useContext, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { useUser } from "../../../hooks/useUser";
import CreateFeedModal from "./CreateFeedModal";

function CreateFeedButton() {
  // hooks
  const { user } = useUser();

  // state
  // show or hide modal when the button is clicked
  const [show, setShow] = useState(false);

  return (
    user !== null && (
      <Container>
        <CreateFeedModal show={show} setShow={setShow} />
        <Row>
          <Col className="text-end" style={{ padding: "0 12px" }}>
            <Button variant="success" onClick={() => setShow(true)}>
              Create Feed
            </Button>
          </Col>
        </Row>
      </Container>
    )
  );
}

export default CreateFeedButton;
