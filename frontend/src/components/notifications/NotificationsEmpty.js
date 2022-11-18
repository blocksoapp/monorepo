import { Alert, Button, Col, Container, Row } from "react-bootstrap";


function NotificationsEmpty() {

    return (
        <Container>
            <Row>
                <Col xs={12}>
                    <Alert variant="warning">
                        Looks like you don't have any notifications at the moment!
                    </Alert>
                </Col>
            </Row>
        </Container>
    )
}


export default NotificationsEmpty;
