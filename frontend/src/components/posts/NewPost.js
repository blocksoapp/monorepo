import { useContext, useState, useEffect } from 'react'
import { 
    Button,
    Container,
    Card,
    Col,
    Form,
    InputGroup,
    Row 
} from "react-bootstrap"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { useEnsAvatar } from "wagmi";
import { apiPostPost } from '../../api';
import { UserContext } from '../../contexts/UserContext';
import useBreakpoint from '../../hooks/useBreakpoint';
import SignInButton from '../authentication/SignInButton';
import MentionsInput from "./MentionsInput";
import PfpResolver from '../PfpResolver';


function NewPost({ submitPostCallback }) {
    // hooks
    const { user } = useContext(UserContext);
    const breakpoint = useBreakpoint();

    // state
    const { address, image } = {...user?.profile}
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
            <Row className="justify-content-center my-3">
                <Col xs={12} lg={6}>
                    <Card style={{ backgroundColor: "#fffff0" }}>
                        {/* Card body that includes the post form details. */}
                        <Card.Body>
                                {/* user is not logged in */}
                                {user === null &&
                                    <Row className="justify-content-center align-items-center">
                                        <Col>
                                            <Row className="ms-sm-3">
                                                <Col className="col-auto">
                                                    <FontAwesomeIcon icon={faLightbulb} size="xl" />
                                                </Col>
                                                <Col>
                                                    <h5>
                                                        Sign in to create a post!
                                                    </h5>
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col className="col-auto">
                                            <SignInButton buttonText="Sign In" />
                                        </Col>
                                    </Row>
                                }
                                
                                {/* user is logged in */}
                                {user !== null &&
                                    <div>

                                        {/* profile picture on small devices */}
                                        <Row className="d-xs-block d-md-none mb-2">
                                            <Col className="col-auto">
                                                <PfpResolver
                                                    address={address}
                                                    imgUrl={image}
                                                    height="35px"
                                                    width="35px"
                                                    fontSize="0.33rem"
                                                />
                                            </Col>
                                        </Row>

                                        <Row className="align-items-center">

                                            {/* profile picture on large devices */}
                                            <Col className="col-auto d-none d-md-block">
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
                                                        <Col className="pe-0">
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
                                                            <Button
                                                                variant="primary"
                                                                type="submit"
                                                                size={breakpoint === "xs" || breakpoint === "sm" ? "sm" : ""}>
                                                                Submit
                                                            </Button>
                                                        </Col>
                                                    </Row>
                                                </Form>
                                            </Col>
                                        </Row>
                                    </div>
                                }
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default NewPost;
