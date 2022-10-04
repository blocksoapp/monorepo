import React, { useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { useAccount } from 'wagmi'
import Search from '../../components/form/Search'
import WalletFeed from './WalletFeed/WalletFeed';
import { useUser } from "../../hooks"


function Home() {  
    // constants
    const user = useUser();

    // state

    // functions

    return (
        <Container>
          {user === null &&
          <h1 class="text-muted text-center">Please sign in.</h1>
          }
          {user !== null &&
          <WalletFeed
              className="mt-5"
              author={user["address"]}
              pfp={user["image"]}
              user={user}
          />
          }
        </Container>
    );
}

export default Home;
