import { Button, Col, Container, Row} from "react-bootstrap";
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";


function BackToFeedsButton() {
    // hooks
    const navigate = useNavigate();

    // render
    return (
        <Container>
            <Row>
                <Col xs={12}>
                    <Button
                        variant="outline-secondary"
                        onClick={() => navigate("/feeds")}
                        className="mb-4"
                    >
                       <FontAwesomeIcon icon={faArrowLeft} />                 
                        &nbsp;Back to Feeds
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}


export default BackToFeedsButton;
