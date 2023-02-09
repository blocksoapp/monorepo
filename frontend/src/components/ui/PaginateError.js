import { Alert, Button, Col, Row } from "react-bootstrap";


function PaginateError({retryAction}) {

    return (
        <Alert variant="danger">
            <Row>
                <Col>
                    <span>Sorry, something went wrong.</span>
                </Col>
                <Col className="col-auto">
                    <Button
                        size="sm"
                        variant="outline-primary"
                        className="float-end"
                        onClick={retryAction}
                    >
                        Retry
                    </Button>
                </Col>
            </Row>
        </Alert>
    )
}


export default PaginateError;
