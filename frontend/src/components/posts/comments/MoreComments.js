import { Alert, Button, Col, Container, Row } from "react-bootstrap";


function MoreComments(props) {

    return (
        <Container>
            <Row className="justify-content-center p-5">
                <Col xs={10} lg={6}>
                    <Alert variant="primary">
                        There are more comments available.
                        <Button
                            size="sm"
                            variant="outline-primary"
                            className="float-end"
                            onClick={props.action}
                        >
                            Load More
                        </Button>
                    </Alert>
                </Col>
            </Row>
        </Container>
    )
}


export default MoreComments;
