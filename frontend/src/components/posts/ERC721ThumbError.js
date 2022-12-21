import { Alert, Button, Col, Container, Row } from "react-bootstrap";


function ERC721ThumbError(props) {

    return (
        <Container>
            <Row className="justify-content-center ps-2 pt-5">
                <Col xs={8}>
                    <Alert variant="warning">
                        <Row className="text-start">
                            <Col xs={12}>
                                Sorry, we were unable to load the image from Opensea.
                            </Col>
                            <Col xs={12}>
                                <Button
                                    size="sm"
                                    className="mt-2"
                                    variant="outline-primary"
                                    onClick={props.retryAction}
                                >
                                    Try Again
                                </Button>
                            </Col>
                        </Row>
                    </Alert>
                </Col>
            </Row>
        </Container>
    )
}


export default ERC721ThumbError;
