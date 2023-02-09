import { useNavigate } from "react-router-dom";
import { Alert, Button, Col, Container, Row } from "react-bootstrap";


function NoFeedItems({feedId}) {

    // hooks
    const navigate = useNavigate();

    // render
    return (
        <Container>
            <Row className="justify-content-center p-5">
                <Col xs={10} lg={6}>
                    <Alert variant="warning">
                        <Row className="align-items-center">
                            <Col>
                                <p>
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
                </Col>
            </Row>
        </Container>
    )
}


export default NoFeedItems;
