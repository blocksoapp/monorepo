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
import Pfp from '../Pfp';
import TxAddress from "../TxAddress";


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
            <Container className="mt-1">
                <Row className="justify-content-center mb-2">
                    <Col xs={12}>
                        <Card>
                            {/* Card body that includes the comment details. */}
                            <Card.Body>
                                <Row className="border-bottom">
                                    <Col className="col-auto">
                                        <Pfp
                                            height="50px"
                                            width="50px"
                                            imgUrl={pfpUrl}
                                            address={props.author}
                                            ensName={ensName}
                                            fontSize="0.5rem"
                                        />
                                    </Col>
                                    <Col className="col-auto">
                                        <TxAddress
                                            address={props.author}
                                            profileAddress={props.profileAddress}
                                        />
                                        <p>
                                            {dateObj.toLocaleDateString("en-US", datetimeOpts)}
                                        </p>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col className="col-auto">
                                        <Card.Text>
                                            {props.text}
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

export default Comment;
