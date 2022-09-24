import React from 'react'
import { Container, Button } from 'react-bootstrap'

function InfoSection() {
  return (
    <>
        <Container fluid className="p-5">
            <div className="info-container border p-5 d-flex flex-column justify-content-center">
                <h1>A Social Platform Curated for <span className="primary-color">WEB3</span></h1>
                <p className="w-75">Blockso is Twitter for blockchain users. Explore, Like, and Follow your favorite wallets. With Blockso, you will be able to keep up to date with web3 trends. Sign in to get started.</p>
                <div>
                    <Button className="btn-lg">Learn More</Button>
                </div>
            </div>
        </Container>
    </>
  )
}

export default InfoSection