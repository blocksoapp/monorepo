import { Alert, Button, Col, Container, Row } from "react-bootstrap";


function CommentsNotFound(props) {

    return (
        <Container>
            <Row className="justify-content-center p-5">
                <Col xs={10} lg={6}>
                    <Alert variant="warning">
                        Be the first to comment, or refresh until something pops up!
                        <Button
                            size="sm"
                            variant="outline-primary"
                            className="float-end"
                            onClick={props.retryAction}
                        >
                            Refresh
                        </Button>
                    </Alert>
                </Col>
            </Row>
        </Container>
    )
}


export default CommentsNotFound;
