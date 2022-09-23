import React, { useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { useAccount } from 'wagmi'
import Search from '../../components/form/Search'
import WalletFeed from './WalletFeed/WalletFeed';

function Home() {  
    return (
        <Container>
          <Row className="justify-content-center">
              <Col xs={12}>
                  <Search/>
              </Col>
          </Row>
          <WalletFeed />
        </Container>
    );
}

export default Home
