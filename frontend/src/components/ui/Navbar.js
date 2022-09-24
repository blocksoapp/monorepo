import { useCallback, useState } from 'react';
import { Button, Container, Col, Form, Nav, Navbar, NavDropdown, NavItem } from 'react-bootstrap'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi';
import DisplayConnection from '../authentication/DisplayConnection';
import SignInButton from '../authentication/SignInButton';


function NavbarComponent() {
    const navigate = useNavigate();
    const account = useAccount();
    const [user, setUser] = useState(null);
    const [searchVal, setSearchVal] = useState("");

    const handleSearch = () => {
        const route = `${searchVal}/profile`;
        navigate(route);
    }

  return (
    <Navbar bg="light" expand="lg" className="mb-5">
      <Container>
        <Navbar.Brand as={Link} to="/">Blockso</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="w-75">
            {user !== null && <Nav.Link as={Link} to="/home">Home</Nav.Link>}
            <Nav.Link as={Link} to="/explore">Explore</Nav.Link>
            {user !== null && <Nav.Link as={Link} to="/edit-profile">Edit Profile</Nav.Link>}
            {user !== null && <Nav.Link as={Link} to={`${user["address"]}/profile`}>My Profile</Nav.Link>}
            <Col auto>
            </Col>
          <Form className="d-flex w-50">
            <Form.Control
              type="search"
              placeholder="Search for user..."
              className="me-2"
              aria-label="Search"
              onChange={event => {setSearchVal(event.target.value)}}
            />
            <Button variant="outline-dark" onClick={handleSearch}>Search</Button>
          </Form>
          </Nav>
        </Navbar.Collapse>
          <SignInButton setUser={setUser} />
      </Container>
    </Navbar>
  );
}

export default NavbarComponent;
