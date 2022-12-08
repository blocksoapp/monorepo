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
import { apiPostPost } from '../../api';
import MentionsInput from "./MentionsInput";
import PfpResolver from '../PfpResolver';


function NewPost({ profileData, submitPostCallback }) {

    // state
    const { address, image } = {...profileData.profile}
    const [postText, setPostText] = useState("");
    const [taggedUsers, setTaggedUsers] = useState([]);

    // functions

    const handleSubmit = async (event) => {
        // prevent default action
        event.preventDefault();

        // post data to api
        const data = {
            text: postText,
            tagged_users: taggedUsers,
        }
        const resp = await apiPostPost(data);

        // handle success
        if (resp.status === 201) {
            // clear form
            setPostText("");
            setTaggedUsers([]);

            // add post to feed
            const postData = await resp.json();
            submitPostCallback(postData);
        }
    }


    return (
        <Container>
            <Row className="justify-content-center">
                <Col xs={12} lg={6}>
                    <Card style={{ backgroundColor: "#fffff0" }}>
                        {/* Card body that includes the post form details. */}
                        <Card.Body>
                            <Row className="align-items-center">
                                <Col className="col-auto">
                                    <PfpResolver
                                        address={address}
                                        imgUrl={image}
                                        height="100px"
                                        width="100px"
                                        fontSize="1rem"
                                    />
                                </Col>
                                <Col>
                                    <Form onSubmit={handleSubmit}>
                                        <Row>
                                            <Col>
                                                <InputGroup>
                                                    <MentionsInput
                                                        placeholder="What's on your mind?"
                                                        text={postText}
                                                        setText={setPostText}
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

export default NewPost;
