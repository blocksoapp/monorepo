import { Card, Col, Container, Image, Placeholder, Row } from "react-bootstrap";


function PostPlaceholder() {
    return (
        <Container className="mt-4 mb-4">
            <Row className="justify-content-center">
                <Col xs={12} lg={6}>
                    <Card>
                        {/* Card header that includes pfp, address, created time. */}
                        <Card.Header>
                            <Row className="align-items-center">
                                <Col className="col-auto">
                                    <Image
                                        className="bg-secondary mt-2"
                                        height="100px"
                                        width="100px"
                                        roundedCircle
                                    />
                                </Col>
                                <Col>
                                    <Placeholder as={Card.Text} animation="wave">
                                        <Placeholder xs={10} />{' '}
                                        <br/>
                                        <Placeholder xs={10} />
                                    </Placeholder>
                                </Col>
                            </Row>
                        </Card.Header>

                        {/* Card body that includes the transaction details. */}
                        <Card.Body>
                            <Placeholder as={Card.Text} animation="wave">
                                <Placeholder xs={8} /> <Placeholder xs={2} />
                                <Placeholder xs={6} /> <Placeholder xs={4} />
                            </Placeholder>
                        </Card.Body>

                        {/* Card footer that includes the action buttons. */}
                        <Card.Footer>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default PostPlaceholder;
