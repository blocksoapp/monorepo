import { useContext, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { UserContext } from "../../../contexts/UserContext";
import useBreakpoint from "../../../hooks/useBreakpoint";
import SignInButton from "../../authentication/SignInButton";
import PfpResolver from "../../PfpResolver";
import MentionsInput from "../MentionsInput";

function PostForm({
  text,
  setText,
  taggedUsers,
  setTaggedUsers,
  handleSubmit,
}) {
  // hooks
  const { user } = useContext(UserContext);
  const breakpoint = useBreakpoint();

  // state
  const { address, image } = { ...user?.profile };

  // render
  return (
    <Container>
      <Row className="justify-content-center">
        <Col>
          <Card style={{ backgroundColor: "#fffff0" }}>
            {/* Card body that includes the post form details. */}
            <Card.Body>
              {/* user is not logged in */}
              {user === null && (
                <Row className="justify-content-center align-items-center">
                  <Col>
                    <Row className="ms-sm-3">
                      <Col className="col-auto">
                        <FontAwesomeIcon icon={faLightbulb} size="xl" />
                      </Col>
                      <Col>
                        <h5>Sign in to create a post!</h5>
                      </Col>
                    </Row>
                  </Col>
                  <Col className="col-auto">
                    <SignInButton buttonText="Sign In" />
                  </Col>
                </Row>
              )}

              {/* user is logged in */}
              {user !== null && (
                <div>
                  {/* profile picture on small devices */}
                  <Row className="d-xs-block d-md-none mb-2">
                    <Col className="col-auto">
                      <PfpResolver
                        address={address}
                        imgUrl={image}
                        height="48px"
                        width="48px"
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
                        height="48px"
                        width="48px"
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
                                text={text}
                                setText={setText}
                                setTaggedUsers={setTaggedUsers}
                              />
                            </InputGroup>
                          </Col>
                          <Col className="col-auto align-self-center">
                            <Button
                              variant="primary"
                              type="submit"
                              size={
                                breakpoint === "xs" || breakpoint === "sm"
                                  ? "sm"
                                  : ""
                              }
                            >
                              Post
                            </Button>
                          </Col>
                        </Row>
                      </Form>
                    </Col>
                  </Row>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default PostForm;
