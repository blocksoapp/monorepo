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
import { baseAPI, getCookie } from '../../utils'
import Pfp from '../Pfp';


function NewComment({ profileData, submitCommentCallback, postId }) {

    // state
    const { address, image } = {...profileData.profile}
    const ensAvatar = useEnsAvatar({addressOrName: address});
    const [pfpUrl, setPfpUrl] = useState(image);
    const [commentText, setCommentText] = useState("");

    // functions

    const handleSubmit = async (event) => {
        // prevent default action
        event.preventDefault();

        // post data to api
        const url = `${baseAPI}/posts/${postId}/comments/`;
        const data = {
            text: commentText,
            tagged_users: []
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

            // add comment to post
            const commentData = await resp.json();
            submitCommentCallback(commentData);
        }
    }

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


    return (
        <Container>
            <Row className="justify-content-center">
                <Col xs={12} lg={6}>
                    <Card style={{ backgroundColor: "#fffff0" }}>
                        {/* Card body that includes the comment form details. */}
                        <Card.Body>
                            <Row className="align-items-end">
                                <Col className="col-auto">
                                    <Pfp
                                        height="75px"
                                        width="75px"
                                        imgUrl={pfpUrl}
                                        address={address}
                                        fontSize="0.75rem"
                                    />
                                </Col>
                                <Col>
                                    <Form onSubmit={handleSubmit}>
                                        <Row>
                                            <Col>
                                                <InputGroup>
                                                    <Form.Control
                                                        as="textarea"
                                                        aria-label="With textarea"
                                                        placeholder="What's on your mind?"
                                                        type="text"
                                                        size="md"
                                                        value={commentText}
                                                        onChange={(event) => setCommentText(event.target.value)}
                                                    />
                                                </InputGroup>
                                            </Col>
                                            <Col className="col-auto">
                                                <Button className="mt-3 float-end" variant="primary" type="submit">
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
