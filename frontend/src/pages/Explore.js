import React from 'react'
import { Container } from 'react-bootstrap'
import FeaturedList from '../components/explore/FeaturedList';
import InfoSection from '../components/explore/InfoSection';

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
