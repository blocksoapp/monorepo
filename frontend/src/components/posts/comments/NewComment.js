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
import { MentionsInput, Mention } from "react-mentions";
import { abbrAddress, baseAPI, getCookie } from '../../../utils'
import { apiGetSuggestedUsers } from '../../../api';
import Pfp from '../../Pfp';
import "./mentions-custom.css";

function NewComment({ authedUser, submitCommentCallback, postId }) {

    // state
    const { address, image } = {...authedUser.profile}
    const ensAvatar = useEnsAvatar({addressOrName: address});
    const [pfpUrl, setPfpUrl] = useState(image);
    const [commentText, setCommentText] = useState("");

    // functions

    /*
     * Parses user addresses from the given text.
     * Returns an array of user addresses.
     */
    const parseTaggedUsers = (commentText) => {
        // look for mentions pattern and capture the address
        // mentions pattern: @[__display__](__0xaddress__)
        const regexp = /@\[[\w\.]*\]\((0x\w{40})\)/gmi;
        const matches = [...commentText.matchAll(regexp)];

        // create array of mentioned user addresses
        var addresses = [];
        for (const match of matches) {
            addresses.push(match[1]);
        }

        return addresses; 
    }

    const handleSubmit = async (event) => {
        // prevent default action
        event.preventDefault();

        // extract the tagged users
        const taggedUsers = parseTaggedUsers(commentText); 

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

            // add comment to post
            const commentData = await resp.json();
            submitCommentCallback(commentData);
        }
    }

    /*
     * Requests a list of users that start with the given query.
     * Calls callback with the results of the response.
     */
    const fetchSuggestedUsers = async (query, callback) => {
        if (!query) return
        const resp = await apiGetSuggestedUsers(query);
        if (resp.ok) {
            const results = await resp.json();
            const formatted = results.map(
                user => ({
                    display: `0x${abbrAddress(user.address)}`,
                    id: user.address
                })
            );
            return callback(formatted);
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
                            <Row className="align-items-center">
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
                                                    <MentionsInput
                                                        className="form-control"
                                                        value={commentText}
                                                        onChange={(event) => setCommentText(event.target.value)}
                                                        placeholder="What's on your mind?"
                                                    >
                                                        <Mention
                                                            trigger="@"
                                                            data={fetchSuggestedUsers}
                                                            appendSpaceOnAdd={true}
                                                        />
                                                    </MentionsInput>
                                                </InputGroup>
                                            </Col>
                                            <Col className="col-auto">
                                                <Button className="float-end" variant="primary" type="submit">
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
