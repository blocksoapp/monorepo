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
import MentionsOutput from './MentionsOutput';
import Pfp from '../../Pfp';
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
    const [pfpUrl, setPfpUrl] = useState(props.pfp)
    const [ensName, setEnsName] = useState(props.ensName);
    const ensAvatar = useEnsAvatar({addressOrName: props.author});
    const ensNameHook = useEnsName({address: props.author});

    // functions

    /* 
     * Sets the user's ens name if it has not been passed in from props.
     */
    useEffect(() => {
        if (!ensName) {
            if (!ensNameHook.isLoading && ensNameHook.data !== null) {
                setEnsName(ensNameHook.data);
            }
        }
    }, [ensNameHook])

    /* 
     * Sets the user's pfp to their ens avatar,
     * if the user has not uploaded a profile pic.
     */
    useEffect(() => {
        if (!pfpUrl) {
            if (!ensAvatar.isLoading && ensAvatar.data !== null) {
                setPfpUrl(ensAvatar.data);
            }
        }
    }, [ensAvatar])


    const render = function () {
        const dateObj = new Date(props.created);

        return (
            <Container className="mt-3">
                <Row className="justify-content-center mb-2">
                    <Col xs={12} lg={6}>
                        <Card>
                            {/* Card header that includes pfp, address, created time. */}
                            <Card.Header>
                                <Row className="align-items-end">
                                    <Col className="col-auto">
                                        <Pfp
                                            height="100px"
                                            width="100px"
                                            imgUrl={pfpUrl}
                                            address={props.author}
                                            fontSize="1rem"
                                        />
                                    </Col>
                                    <Col className="col-auto">
                                        <h5>
                                            <TxAddress
                                                address={props.author}
                                                profileAddress={props.profileAddress}
                                            />
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
