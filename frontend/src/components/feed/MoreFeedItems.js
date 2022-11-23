import { Alert, Button, Col, Container, Row } from "react-bootstrap";


function MoreFeedItems(props) {

    return (
        <Container>
            <Row className="justify-content-center p-5">
                <Col xs={10} lg={6}>
                    <Alert variant="primary">
                        There are more items in your feed!
                        <Button
                            size="sm"
                            variant="outline-primary"
                            className="float-md-end mt-3 mt-md-0"
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


export default MoreFeedItems;
