import { Container, Nav, Navbar, NavDropdown, NavItem } from 'react-bootstrap'
import { BrowserRouter, NavLink } from 'react-router-dom'
import DisplayConnection from '../authentication/DisplayConnection';
import SignInButton from '../authentication/SignInButton';

function NavbarComponent() {
  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand href="#home">Blockso</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <NavItem><NavLink to="/home">Home</NavLink></NavItem>
            <NavItem><NavLink to="/explore">Explore</NavLink></NavItem>
            <NavItem><NavLink to="/create-profile">Create Profile</NavLink></NavItem>
            <NavDropdown title="Profile" id="basic-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">
                Another action
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
                Separated link
              </NavDropdown.Item>
            </NavDropdown>
              <div>
              <SignInButton/>
              <DisplayConnection/>
              </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarComponent;