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


function NewPost({ profileData, submitPostCallback }) {

    // state
    const { address, image } = {...profileData.profile}
    const ensAvatar = useEnsAvatar({addressOrName: address});
    const [pfpUrl, setPfpUrl] = useState(image);
    const [postText, setPostText] = useState("");

    // functions

    const handleSubmit = async (event) => {
        // prevent default action
        event.preventDefault();

        // post data to api
        const url = `${baseAPI}/posts/${address}/`;
        const data = {
            text: postText,
            imgUrl: "",
            isShare: false,
            isQuote: false,
            refPost: null,
            refTx: null,
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
            setPostText("");

            // add post to feed
            const postData = await resp.json();
            submitPostCallback(postData);
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
                        {/* Card body that includes the post form details. */}
                        <Card.Body>
                            <Row>
                                <Col className="col-auto">
                                    <Pfp
                                        height="100px"
                                        width="100px"
                                        imgUrl={pfpUrl}
                                        address={address}
                                        fontSize="1rem"
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
                                                        placeholder="What kinda cool stuff are we gonna post today!?"
                                                        type="text"
                                                        size="lg"
                                                        value={postText}
                                                        onChange={(event) => setPostText(event.target.value)}
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

export default NewPost;