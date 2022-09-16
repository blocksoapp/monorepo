import React, { useState } from 'react'
import { Container } from 'react-bootstrap'
import { useAccount } from 'wagmi'
import Search from '../../components/form/Search'
import WalletFeed from './WalletFeed/WalletFeed';

function Home() {  
    return (
        <div>
          <Container>
            <h1>Home Page</h1>
            <Search/>
          </Container>
        </div>
      );
}

export default Home