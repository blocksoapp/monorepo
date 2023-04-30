import React from "react";
import { Container } from "react-bootstrap";
import InfoSection from "../components/explore/InfoSection";
import ExploreSection from "../components/explore/ExploreSection";
import MainHeader from "../components/ui/MainHeader";

function Explore() {
  return (
    <div>
      <Container fluid>
        <MainHeader header="Explore" />
        <InfoSection />
        <ExploreSection />
      </Container>
    </div>
  );
}

export default Explore;
