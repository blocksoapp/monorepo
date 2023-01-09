import { useState, useContext } from "react";
import { Button, Container, Col, Form, Nav, Navbar } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import SignInButton from "../authentication/SignInButton";
import NotificationsDropdown from "../notifications/NotificationsDropdown";
import { UserContext } from "../../contexts/UserContext";
import { useSIWE } from "connectkit";

function NavbarComponent() {
  const { user } = useContext(UserContext);
  const { signedIn } = useSIWE();
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState("");

  const handleSearch = () => {
    const route = `${searchVal}/profile`;
    navigate(route);
    setSearchVal(""); // clear input
  };

  const onKeyPress = (event) => {
    // search when user presses enter
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Navbar bg="light" expand="lg" className="mb-5">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Blockso
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="w-100">
            {user !== null && signedIn && (
              <Nav.Link as={Link} to="/home">
                Home
              </Nav.Link>
            )}
            <Nav.Link as={Link} to="/explore">
              Explore
            </Nav.Link>
            {user !== null && signedIn && (
              <Nav.Link as={Link} to="/edit-profile">
                Edit Profile
              </Nav.Link>
            )}
            {user !== null && signedIn && (
              <Nav.Link as={Link} to={`${user["address"]}/profile`}>
                My Profile
              </Nav.Link>
            )}
            <Col className="col-auto"></Col>
            <Col xs={10} lg={5}>
              <Form.Control
                type="search"
                placeholder="Search ENS or address"
                className="me-2"
                aria-label="Search"
                value={searchVal}
                onChange={(event) => {
                  setSearchVal(event.target.value);
                }}
                onKeyPress={onKeyPress}
              />
            </Col>
            &nbsp;
            <Col xs={2}>
              <Button variant="outline-dark" onClick={handleSearch}>
                Search
              </Button>
            </Col>
          </Nav>
        </Navbar.Collapse>

        {/* Notifications */}
        {user !== null && signedIn && <NotificationsDropdown />}

        {/* Sign In/Out */}
        <SignInButton buttonText="Sign In" />
      </Container>
    </Navbar>
  );
}

export default NavbarComponent;
