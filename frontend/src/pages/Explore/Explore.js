import React, { useState } from 'react'
import { Container, Row } from 'react-bootstrap'
import Search from '../../components/form/Search';
import { useAccount, useEnsAddress } from 'wagmi'
import FeaturedList from './FeaturedList';
import InfoSection from './InfoSection';

function Explore() {
  const {address} = useAccount  

  return (
    <div>
      <Container fluid>
        <h1 className='text-center p-3 fw-bolder'>Explore Page</h1>
        <Search/>
            <InfoSection/>
            <FeaturedList/>
      </Container>
    </div>
  );
}

export default Explore;
