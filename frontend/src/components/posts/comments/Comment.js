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
import { apiDeleteCommentLike, apiPostCommentLike } from '../../../api.js';
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
    const [data, setData] = useState(props.data);

    /*
     * Handles user clicking the Like button.
     * Likes the item if the user has not already liked.
     * Unlikes the item if the user has already liked it.
     */
    const handleLikeClick = async function() {
        data.likedByMe ? await doUnlikeComment() : await doLikeComment();
    }

    /*
     * Likes the current comment as the authenticated user.
     */
    const doLikeComment = async function() {
        const resp = await apiPostCommentLike(props.postId, data.id);

        // success handling
        if (resp.status === 201) {
            setData({
                ...data,
                numLikes: data["numLikes"] + 1,
                likedByMe: true
            });
        }
        // error handling
        else {
            console.error(resp);
        }        
    }

    /*
     * Un-Likes the current comment as the authenticated user.
     */
    const doUnlikeComment = async function() {
        const resp = await apiDeleteCommentLike(props.postId, data.id);

        // success handling
        if (resp.status === 204) {
            setData({
                ...data,
                numLikes: data["numLikes"] - 1,
                likedByMe: false
            });
        }
        // error handling
        else {
            console.error(resp);
        }        
    }


    const render = function () {
        const dateObj = new Date(data.created);

        return (
            <Container id={data.id} className="mt-3">
                <Row className="justify-content-center mb-2">
                    <Col xs={12} lg={6}>
                        <Card>
                            {/* Card header that includes pfp, address, created time. */}
                            <Card.Header>
                                <Row className="align-items-end">
                                    <Col className="col-auto">
                                        <PfpResolver
                                            address={data.author.address}
                                            imgUrl={data.author.image}
                                            height="100px"
                                            width="100px"
                                            fontSize="1rem"
                                        />
                                    </Col>
                                    <Col className="col-auto">
                                        <h5>
                                            <AuthorAddress address={data.author.address} />
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
                                                text={data.text}
                                            />
                                        </Card.Text>
                                    </Col>
                                </Row>
                            </Card.Body>

                            {/* Card footer that includes the action buttons. */}
                            <Card.Footer>
                                <Row className="justify-content-around align-items-center">
                                    {/* Like button */}
                                    <Col className="col-auto">
                                        <Button
                                            size="sm"
                                            variant={
                                                data.likedByMe === true
                                                    ? "outline-danger"
                                                    : "light"
                                            }
                                            onClick={() => handleLikeClick()}
                                            style={{
                                                color: data.numLikes > 0 ? "#dc3545" : ""
                                            }}
                                        >
                                            {data.numLikes}&nbsp;&nbsp;
                                            <FontAwesomeIcon icon={faHeart} />
                                        </Button>
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
