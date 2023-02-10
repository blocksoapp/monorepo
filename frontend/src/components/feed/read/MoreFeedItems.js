import { Alert, Button, Col, Container, Row } from "react-bootstrap";


function MoreFeedItems(props) {

    return (
        <Container>
            <Row className="justify-content-center p-5">
                <Col xs={12} md={10} lg={6}>
                    <Alert variant="primary">
                        There are more items in your feed!
                        <Button
                            size="sm"
                            variant="outline-primary"
                            className="d-grid mt-2 d-sm-block mt-sm-0 float-sm-end"
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
