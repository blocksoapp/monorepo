import { 
    Container,
    Card,
    Col,
    Row 
} from "react-bootstrap"


function SignInToComment() {

    return (
        <Container>
            <Row className="justify-content-center">
                <Col xs={12} lg={6}>
                    <Card style={{ backgroundColor: "#fffff0" }}>
                        {/* Card body that includes the comment form details. */}
                        <Card.Body>
                            Sign in if you want to comment :)
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default SignInToComment;
