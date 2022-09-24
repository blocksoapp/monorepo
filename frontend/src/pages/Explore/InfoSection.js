import React from 'react'
import { Container, Button } from 'react-bootstrap'

function InfoSection() {
  return (
    <>
        <Container fluid className="p-5">
            <div className="border info-container border p-4 d-flex justify-content-center align-item-center">
                <div className='w-75 p-3'>
                    <h1>A Social Platform Curated for <span className="primary-color">WEB3</span></h1>
                    <p className="">Blockso is Twitter for blockchain users. 
                    Follow your favorite wallets closely, without endlessly navigating through etherscan. 
                    With Blockso, you have the ability to keep up to date with web3 trends at the tip of your fingers. 
                    Connect your wallet to get started.</p>
                    <div className="mt-2">
                        <Button className="btn-lg">Learn More</Button>
                    </div>
                </div>
            </div>
        </Container>
    </>
  )
}

export default InfoSection