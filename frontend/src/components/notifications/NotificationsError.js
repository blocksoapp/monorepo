import { Alert, Button, Col, Container, Row } from "react-bootstrap";


function NotificationsError({retryAction}) {

    return (
        <Container>
            <Row>
                <Col xs={12}>
                    <Alert variant="danger">
                        Sorry, something went wrong.
                        <br/>
                        Please report the issue if it persists.
                    </Alert>
                    <Button
                        variant="outline-primary"
                        onClick={retryAction}
                    >
                        Retry
                    </Button>
                </Col>
            </Row>
        </Container>
    )
}


export default NotificationsError;
