import React from 'react'
import { Container } from 'react-bootstrap'
import Search from '../../components/form/Search'

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