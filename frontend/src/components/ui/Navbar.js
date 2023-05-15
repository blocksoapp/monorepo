import { useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import { Button, Container, Col, Form, Nav, Navbar } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import SignInButton from "../authentication/SignInButton";
import NotificationsDropdown from "../notifications/NotificationsDropdown";
import { UserContext } from "../../contexts/UserContext";
import { useSIWE } from "connectkit";
import "./sidenavbar/sidenavbar.css";
import SearchBar from "../searchbar/SearchBar";

function NavbarComponent() {
  const routerLocation = useLocation();
  const { user } = useContext(UserContext);
  const { signedIn } = useSIWE();
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState("");

  const handleSearch = () => {
    const route = `${searchVal.trim()}/profile`;
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
    <Navbar expand="lg" className="top-navbar sticky-top">
      <Container className="p-0">
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="collapse-container">
          <Nav className="w-100" activeKey={routerLocation.pathname}>
            {user !== null && signedIn && (
              <Nav.Link as={Link} to="/" eventKey="/">
                My Feed
              </Nav.Link>
            )}
            {user !== null && signedIn && (
              <Nav.Link as={Link} to={`/feeds`} eventKey={`/feeds`}>
                Feeds
              </Nav.Link>
            )}
            <Nav.Link as={Link} to="/explore" eventKey="/explore">
              Explore
            </Nav.Link>
            {user !== null && signedIn && (
              <Nav.Link as={Link} to="/edit-profile" eventKey="/edit-profile">
                Edit Profile
              </Nav.Link>
            )}
            {user !== null && signedIn && (
              <Nav.Link
                as={Link}
                to={`${user["address"]}/profile`}
                eventKey={`${user["address"]}/profile`}
              >
                My Posts
              </Nav.Link>
            )}
            <Col className="col-auto"></Col>
            <SearchBar />
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
