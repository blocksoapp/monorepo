import React, { useState, useEffect } from 'react'
import { 
    Button,
    Container,
    Card,
    Col,
    Form,
    InputGroup,
    Row 
} from "react-bootstrap"
import { useEnsAvatar } from "wagmi";
import { baseAPI, getCookie } from '../../../utils'
import PfpResolver from '../../PfpResolver';
import MentionsInput from '../MentionsInput';

function NewComment({ authedUser, submitCommentCallback, postId }) {

    // state
    const { address, image } = {...authedUser.profile}
    const [commentText, setCommentText] = useState("");
    const [taggedUsers, setTaggedUsers] = useState([]);

    // functions

    const handleSubmit = async (event) => {
        // prevent default action
        event.preventDefault();

        // post data to api
        const url = `${baseAPI}/posts/${postId}/comments/`;
        const data = {
            text: commentText,
            tagged_users: taggedUsers
        }
        const resp = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFTOKEN': getCookie('csrftoken')
            },
            credentials: 'include'
        });

        // handle success
        if (resp.status === 201) {
            // clear form
            setCommentText("");
            setTaggedUsers([]);

            // add comment to post
            const commentData = await resp.json();
            submitCommentCallback(commentData);
        }
    }


    return (
        <Container>
            <Row className="justify-content-center">
                <Col xs={12} lg={6}>
                    <Card style={{ backgroundColor: "#fffff0" }}>
                        {/* Card body that includes the comment form details. */}
                        <Card.Body>
                            <Row className="align-items-center">
                                <Col className="col-auto">
                                    <PfpResolver
                                        address={address}
                                        imgUrl={image}
                                        height="75px"
                                        width="75px"
                                        fontSize="0.75rem"
                                    />
                                </Col>
                                <Col>
                                    <Form onSubmit={handleSubmit}>
                                        <Row>
                                            <Col>
                                                <InputGroup> 
                                                    <MentionsInput
                                                        placeholder="What's on your mind?"
                                                        text={commentText}
                                                        setText={setCommentText}
                                                        setTaggedUsers={setTaggedUsers}
                                                    />
                                                </InputGroup>
                                            </Col>
                                            <Col className="col-auto align-self-center">
                                                <Button variant="primary" type="submit">
                                                    Submit
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default NewComment;
