import React from 'react'
import { Container } from 'react-bootstrap'
import InfoSection from '../components/explore/InfoSection';
import ExploreSection from '../components/explore/ExploreSection';

function Explore() {
 
  return (
    <div>
      <Container fluid>
            <InfoSection/>
            <ExploreSection />
      </Container>
    </div>
  );
}

export default Explore;
