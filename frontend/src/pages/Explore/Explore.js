import React, { useState } from 'react'
import { Container, Row } from 'react-bootstrap'
import Search from '../../components/form/Search';
import { useAccount, useEnsAddress } from 'wagmi'
import FeaturedList from './FeaturedList';

function Explore() {
  const {address} = useAccount  

  return (
    <div>
      <Container fluid>
        <h1 className='text-center p-3'>Explore Page</h1>
        <Search/>
            <FeaturedList/>
      </Container>
    </div>
  );
}

export default Explore;
