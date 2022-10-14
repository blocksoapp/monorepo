import { Alert, Button, Col, Container, Row } from "react-bootstrap";


function PostsError(props) {

    return (
        <Container>
            <Row className="justify-content-center p-5">
                <Col xs={10} lg={6}>
                    <Alert variant="danger">
                        Sorry, something went wrong. Please report the issue if it persists.
                        <Button
                            size="sm"
                            variant="outline-primary"
                            className="float-end"
                            onClick={props.retryAction}
                        >
                            Retry
                        </Button>
                    </Alert>
                </Col>
            </Row>
        </Container>
    )
}


export default PostsError;
