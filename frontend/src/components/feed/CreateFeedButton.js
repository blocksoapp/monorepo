import React from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import CreateFeedModal from "./CreateFeedModal";


function CreateFeedButton() {
    // show or hide modal when the button is clicked
    const [show, setShow] = React.useState(false);


    return (
        <Container>
            <CreateFeedModal show={show} setShow={setShow} />
            <Row>
                <Col className="text-end">
                    <Button
                        variant="success"
                        onClick={() => setShow(true)}
                    >
                        Create Feed
                    </Button>
                </Col>
            </Row>
        </Container>
    )
}

export default CreateFeedButton;

