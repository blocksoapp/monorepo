import { Card, Col, Image, Placeholder, Row } from "react-bootstrap";


function FeedsPlaceholder() {
    return (
        <Row>
            <Col xs={6}>
                <Card>
                    <Image
                        className="bg-secondary mt-2 align-self-center"
                        height="256px"
                        width="256px"
                        roundedCircle
                    />
                    <Card.Body>
                        <Placeholder as={Card.Title} className="text-center" animation="glow">
                            <Placeholder xs={8} />
                        </Placeholder>
                        <Placeholder as={Card.Text} className="text-center" animation="wave">
                            <Placeholder xs={10} /> <Placeholder xs={4} /> <Placeholder xs={4} />{' '}
                            <Placeholder xs={2} />
                        </Placeholder>
                    </Card.Body>
                </Card>
            </Col>
            <Col xs={6}>
                <Card>
                    <Image
                        className="bg-secondary mt-2 align-self-center"
                        height="256px"
                        width="256px"
                        roundedCircle
                    />
                    <Card.Body>
                        <Placeholder as={Card.Title} className="text-center" animation="glow">
                            <Placeholder xs={8} />
                        </Placeholder>
                        <Placeholder as={Card.Text} className="text-center" animation="wave">
                            <Placeholder xs={10} /> <Placeholder xs={4} /> <Placeholder xs={4} />{' '}
                            <Placeholder xs={2} />
                        </Placeholder>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    )
}

export default FeedsPlaceholder;
