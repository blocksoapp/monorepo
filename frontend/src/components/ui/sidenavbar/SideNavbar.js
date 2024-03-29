import React, { useContext } from "react";
import { Nav, Container, Button, Image } from "react-bootstrap";
import { useLocation, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faBell,
  faUser,
  faCog,
  faRss,
  faHashtag,
} from "@fortawesome/free-solid-svg-icons";
import "./sidenavbar.css";
import BlocksoSVG from "../../../assets/img/blockso.svg";
import BlocksoSmSVG from "../../../assets/img/blockso-sm.svg";
import SignInButton from "../../authentication/SignInButton";
import { useUser } from "../../../hooks/useUser";

function SideNavbar() {
  const routerLocation = useLocation();
  const { user } = useUser();

  return (
    <Container className="sidebar">
      <div className="logo">
        <Link to="/">
          <Image className="logo-image" src={BlocksoSVG} alt="Blockso Logo" />
          <Image
            className="logo-image-sm"
            src={BlocksoSmSVG}
            alt="Blockso Logo"
          />
        </Link>
      </div>
      <Nav className="flex-column" activeKey={routerLocation.pathname}>
        {user !== null && (
          <Nav.Link as={Link} to="/" eventKey="/">
            <FontAwesomeIcon icon={faHome} className="icon" />
            <span>My Feed</span>
          </Nav.Link>
        )}
        <Nav.Link as={Link} to="/explore" eventKey="/explore">
          <FontAwesomeIcon icon={faHashtag} className="icon" />
          <span>Explore</span>
        </Nav.Link>

        {user !== null && (
          <Nav.Link as={Link} to="/notifications" eventKey={`/notifications`}>
            <FontAwesomeIcon icon={faBell} className="icon" />
            <span>Notifications</span>
          </Nav.Link>
        )}

        {user !== null && (
          <Nav.Link as={Link} to={`/feeds`} eventKey={`/feeds`}>
            <FontAwesomeIcon icon={faRss} className="icon" />
            <span>Feeds</span>
          </Nav.Link>
        )}

        {user !== null && (
          <Nav.Link
            as={Link}
            to={`${user["address"]}/profile`}
            eventKey={`${user["address"]}/profile`}
          >
            <FontAwesomeIcon icon={faUser} className="icon" />
            <span>Profile</span>
          </Nav.Link>
        )}

        {user !== null && (
          <Nav.Link as={Link} to="/edit-profile" eventKey="/edit-profile">
            <FontAwesomeIcon icon={faCog} className="icon" />
            <span>Settings</span>
          </Nav.Link>
        )}

        {/*      <Button className="post-button" disabled={!user}>
          Post
        </Button> */}
      </Nav>
      <div className="siwe-button">
        <SignInButton />
      </div>
    </Container>
  );
}

export default SideNavbar;
