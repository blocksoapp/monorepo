import React from 'react'
import { Container } from 'react-bootstrap'
import FeaturedList from '../components/Explore/FeaturedList';
import InfoSection from '../components/Explore/InfoSection';

function Explore() {
 
  return (
    <div>
      <Container fluid>
            <InfoSection/>
            <FeaturedList/>
      </Container>
    </div>
  );
}

export default Explore;
