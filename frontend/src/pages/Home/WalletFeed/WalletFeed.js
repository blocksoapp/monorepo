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
import Blockies from 'react-blockies';
import { baseAPI, getCookie } from '../../../utils'
import Post from '../../../components/post.js'; 
import PostsPlaceholder from '../../../components/PostsPlaceholder';


function WalletFeed(props) {

    // state
    const ensAvatar = useEnsAvatar({addressOrName: props.author});
    const [pfpUrl, setPfpUrl] = useState(null);
    const [postText, setPostText] = useState("");
    const [loadingFeed, setLoadingFeed] = useState(true);
    const [posts, setPosts] = useState(null);

    // functions

    /* 
     * Sets the user's pfp to their ens avatar
     * if the user has not uploaded a profile pic.
     * Returns null if the user does not have an
     * ens avatar. That way a blockie will be
     * displayed instead.
     */
    const determineProfilePic = (pfp) => {
        // if no image url was passed in
        if (pfp === null || pfp === undefined || pfp === "") {
            // if user has an ens avatar then use it
            if (ensAvatar["data"] !== null) {
                setPfpUrl(ensAvatar["data"]);
            }
        }
    }

    const handleSubmit = async (event) => {
        // prevent default action
        event.preventDefault();

        // post data to api
        const url = `${baseAPI}/posts/${props.author}/`;
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
            setLoadingFeed(false);
        }
        else {
            // TODO show feedback here
            console.log("unhandled case: ", res)
            setLoadingFeed(false);
        }
    }

    // set profile pic and fetch feed on mount
    useEffect(() => {
        fetchFeed();
        determineProfilePic(props.pfp);
    }, [])


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
                                        {pfpUrl === null
                                        ? <Blockies
                                            seed={props.author}
                                            size={15}
                                            scale={5}
                                            className="rounded-circle"
                                            color="#ff5412"
                                            bgColor="#ffb001"
                                            spotColor="#4db3e4"
                                          />
                                        : <Image
                                            src={pfpUrl}
                                            height="100px"
                                            width="100px"
                                            roundedCircle
                                          />
                                        }
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
            : <Container>
                {posts && posts.map(post => (
                    <Post
                        key={post.id}
                        author={post.author}
                        text={post.text}
                        imgUrl={post.imgUrl}
                        created={post.created}
                        refTx={post.refTx}
                        pfp={pfpUrl}
                    />
                ))}
            </Container>
            }

        </Container>
    )
}

export default WalletFeed;
