import { Alert, Button, Col, Container, Row } from "react-bootstrap";


function PostsNotFound(props) {

    return (
        <Container>
            <Row className="justify-content-center p-5">
                <Col xs={10} lg={6}>
                    <Alert variant="info">
                        Looks like this user hasn't posted anything...
                        <Button
                            size="sm"
                            variant="outline-success"
                            className="float-end"
                            onClick={props.retryAction}
                        >
                            Try Again!
                        </Button>
                    </Alert>
                </Col>
            </Row>
        </Container>
    )
}


export default PostsNotFound;
