import React from 'react'
import { Container, Button } from 'react-bootstrap'

function InfoSection() {
  return (
    <>
        <Container fluid className="p-2 p-sm-5">
            <div className="border info-container border p-4 d-flex justify-content-center align-item-center">
                <div className='w-75 p-1 p-sm-3'>
                    <h1>A Social Platform for <span className="primary-color">WEB3</span></h1>
                    <p className="fs-4 lh-sm">
                        Blockso is a new way to keep up with the crypto world!
                        <br/>
                        Follow your frens, celebrities, and total randos!
                        <br/>
                        Keep them in the loop by sharing your latest!
                    </p>
                </div>
            </div>
        </Container>
    </>
  )
}

export default InfoSection
