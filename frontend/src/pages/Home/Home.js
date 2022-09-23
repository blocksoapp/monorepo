import React, { useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { useAccount } from 'wagmi'
import Search from '../../components/form/Search'
import WalletFeed from './WalletFeed/WalletFeed';
import { useUser } from "../../hooks";


function Home() {  
    // constants
    const user = useUser();

    // state

    // functions


    return (
        <Container>
          <Row className="justify-content-center">
              <Col xs={12}>
                  <Search/>
              </Col>
          </Row>
          {user !== null &&
          <WalletFeed
              author={user["address"]}
          />
          }
        </Container>
    );
}

export default Home;
