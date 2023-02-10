import { useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import DeleteFeedModal from "./DeleteFeedModal";


function DeleteFeedButton({feedId}) {
    // show or hide modal when the button is clicked
    const [show, setShow] = useState(false);


    return (
        <Row>
            <Col>
                <DeleteFeedModal feedId={feedId} show={show} setShow={setShow} />
                <Button
                    variant="outline-danger"
                    onClick={() => setShow(true)}
                >
                    Delete Feed
                </Button>
            </Col>
        </Row>
    )
}

export default DeleteFeedButton;
