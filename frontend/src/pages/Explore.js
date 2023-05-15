import React from "react";
import { Container } from "react-bootstrap";
import ExploreSection from "../components/explore/ExploreSection";
import MainHeader from "../components/ui/MainHeader";

function Explore() {
  return (
    <div>
      <Container fluid>
        <MainHeader header="Explore" />
        <ExploreSection />
      </Container>
    </div>
  );
}

export default Explore;
