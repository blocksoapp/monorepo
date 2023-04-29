import React, { useContext } from "react";
import { Container, Row, Col } from "react-bootstrap";
import MyFeed from "../components/feed/read/MyFeed";
import { UserContext } from "../contexts/UserContext";
import { useSIWE } from "connectkit";
import SideNavbar from "../components/ui/sidenavbar/SideNavbar";

function Home() {
  // constants
  const { user } = useContext(UserContext);
  const { signedIn } = useSIWE();

  return (
    <Container className="p-0">
      {user !== null && signedIn ? (
        <MyFeed className="mt-5" profileData={user} />
      ) : (
        <h1 class="text-muted text-center">Please sign in.</h1>
      )}
    </Container>
  );
}

export default Home;
