import { 
    Container,
    Card,
    Col,
    Image,
    Row 
} from "react-bootstrap"
import EnsAndAddress from "./ensName.js";


function Post(props) {
    // state

    // constants
    const datetimeOpts = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour12: true,
        hour: 'numeric',
        minute: 'numeric'
    };

    // functions
    const render = function () {
        const dateObj = new Date(props.created);

        return (
            <Container className="mt-4">
                <Row className="justify-content-center">
                    <Col xs={12} lg={6}>
                        <Card>
                            {/* Card header that includes pfp, address, created time. */}
                            <Card.Body>
                                <Row className="align-items-end">
                                    <Col className="col-auto">
                                        <Image
                                            src={props.pfp}
                                            height="100px"
                                            width="100px"
                                            roundedCircle
                                        />
                                    </Col>
                                    <Col className="col-auto">
                                        <EnsAndAddress address={props.author} />
                                        <p>
                                            {dateObj.toLocaleDateString("en-US", datetimeOpts)}
                                        </p>
                                    </Col>
                                </Row>
                            </Card.Body>

                            {/* Card body that includes the tx details. */}
                            <Card.Body>
                                <Row className="align-items-baseline">
                                    <Col className="col-auto">
                                        <Card.Text>
                                            A lot of info goes here including {props.text}
                                        </Card.Text>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        )
    }

    return render();
}

export default Post;
