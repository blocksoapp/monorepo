import React from 'react'
import { Container } from 'react-bootstrap'
import FeaturedList from './FeaturedList';
import InfoSection from './InfoSection';
import Footer from '../../components/ui/Footer'

function Explore() {
 
  return (
    <div>
      <Container fluid>
            <InfoSection/>
            <FeaturedList/>
            <Footer/>
      </Container>
    </div>
  );
}

export default Explore;
