import React, { useState, useEffect } from 'react'
import { 
    Button,
    Container,
    Card,
    Col,
    Form,
    Image,
    InputGroup,
    Row 
} from "react-bootstrap"
import { useEnsAvatar } from "wagmi";
import { baseAPI, getCookie } from '../../utils'
import Post from '../posts/Post.js'; 
import PostsPlaceholder from '../posts/PostsPlaceholder';
import FeedError from './FeedError';
import Pfp from '../Pfp';


function Feed({ profileData, setProfileData, user }) {

    const { address, image } = {...profileData.profile}

    // state
    const ensAvatar = useEnsAvatar({addressOrName: address});
    const [pfpUrl, setPfpUrl] = useState(image);
    const [postText, setPostText] = useState("");
    const [loadingFeed, setLoadingFeed] = useState(true);
    const [feedError, setFeedError] = useState(false);
    const [posts, setPosts] = useState(null);

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
            setPosts([postData].concat(posts)); 
        }
    }

    const fetchFeed = async () => {
        const url = `${baseAPI}/feed/`;
        setLoadingFeed(true);
        const res = await fetch(url, {
            method: 'GET',
            credentials: 'include'
        });
        if (res.status === 200) {
            var data = await res.json();
            setPosts(data);
            setFeedError(false);
            setLoadingFeed(false);
        }
        else {
            // TODO show feedback here
            setFeedError(true);
            setLoadingFeed(false);
            console.error(res);
        }
    }

    // fetch feed on mount
    useEffect(() => {
        fetchFeed();
        return () => {
            console.log(pfpUrl)
        }
    }, [])

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

            {/* New Post Form */}
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

            {/* Feed or Placeholder */}
            {loadingFeed === true
            ? <PostsPlaceholder />
            : feedError === true
                ? <FeedError retryAction={fetchFeed} />
                : <Container>
                    {posts && posts.map(post => (
                        <Post
                            key={post.id}
                            author={post.author}
                            text={post.text}
                            imgUrl={post.imgUrl}
                            created={post.created}
                            refTx={post.refTx}
                            profileAddress={user['address']}
                        />
                    ))}
                </Container>
            }

        </Container>
    )
}

export default Feed;
