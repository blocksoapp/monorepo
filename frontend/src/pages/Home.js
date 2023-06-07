import React, { useContext } from "react";
import { Container, Row, Col } from "react-bootstrap";
import MyFeed from "../components/feed/read/MyFeed";
import { useUser } from "../hooks/useUser";
import SideNavbar from "../components/ui/sidenavbar/SideNavbar";
import MainHeader from "../components/ui/MainHeader";

function Home() {
  // constants
  const { user } = useUser();

  return (
    <Container className="p-0">
      <MainHeader header="My Feed" />
      {user !== null ? (
        <MyFeed className="mt-5" profileData={user} />
      ) : (
        <h1 class="text-muted text-center">Please sign in.</h1>
      )}
    </Container>
  );
}

export default Home;
