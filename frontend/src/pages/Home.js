import React, { useEffect, useState, useContext } from "react";
import { Container } from "react-bootstrap";
import Feed from "../components/feed/Feed";
import { UserContext } from "../contexts/UserContext";
import { useSIWE } from "connectkit";

function Home() {
  // constants
  const { user } = useContext(UserContext);
  const { signedIn } = useSIWE();

  // functions

  return (
    <Container>
      {user !== null && signedIn ? (
        <Feed className="mt-5" profileData={user} />
      ) : (
        <h1 class="text-muted text-center">Please sign in.</h1>
      )}
    </Container>
  );
}

export default Home;
