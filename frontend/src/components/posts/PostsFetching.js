import { Alert, Button, Col, Container, Row } from "react-bootstrap";


function PostsFetching(props) {

    return (
        <Container>
            <Row className="justify-content-center p-5">
                <Col xs={10} lg={6}>
                    <Alert variant="warning">
                        <p>
                            Hey there, we're getting this user's posts for the first time!<br/>
                            Feel free to wait for a notification, or come back in a minute!
                        </p>
                    </Alert>
                </Col>
            </Row>
        </Container>
    )
}


export default PostsFetching;
