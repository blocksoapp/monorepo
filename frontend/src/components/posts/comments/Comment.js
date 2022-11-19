import { useEffect, useState } from "react";
import { 
    Button,
    Container,
    Card,
    Col,
    Image,
    Row 
} from "react-bootstrap"
import { Link } from "react-router-dom";
import { useEnsAvatar, useEnsName } from "wagmi";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faRetweet, faQuoteRight, faComment  } from '@fortawesome/free-solid-svg-icons'
import MentionsOutput from '../MentionsOutput';
import PfpResolver from '../../PfpResolver';
import AuthorAddress from "../AuthorAddress";
import TxAddress from "../../TxAddress";


function Comment(props) {
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

    // state

    // functions


    const render = function () {
        const dateObj = new Date(props.created);

        return (
            <Container id={props.id} className="mt-3">
                <Row className="justify-content-center mb-2">
                    <Col xs={12} lg={6}>
                        <Card>
                            {/* Card header that includes pfp, address, created time. */}
                            <Card.Header>
                                <Row className="align-items-end">
                                    <Col className="col-auto">
                                        <PfpResolver
                                            address={props.author}
                                            imgUrl={props.pfp}
                                            height="100px"
                                            width="100px"
                                            fontSize="1rem"
                                        />
                                    </Col>
                                    <Col className="col-auto">
                                        <h5>
                                            <AuthorAddress address={props.author} />
                                        </h5>
                                        <p>
                                            {dateObj.toLocaleDateString("en-US", datetimeOpts)}
                                        </p>
                                    </Col>
                                </Row>
                            </Card.Header>

                            {/* Card body that includes the comment details. */}
                            <Card.Body>
                                <Row>
                                    <Col className="col-auto">
                                        <Card.Text>
                                            <MentionsOutput
                                                text={props.text}
                                            />
                                        </Card.Text>
                                    </Col>
                                </Row>
                            </Card.Body>

                            {/* Card footer that includes the action buttons. */}
                            <Card.Footer>
                                <Row className="justify-content-around align-items-center">
                                    <Col className="col-auto">
                                        <Button size="sm" variant="light"><FontAwesomeIcon icon={faHeart} /></Button>
                                    </Col>
                                </Row>
                            </Card.Footer>
                        </Card>
                    </Col>
                </Row>

            </Container>
        )
    }

    return render();
}

export default Comment;
