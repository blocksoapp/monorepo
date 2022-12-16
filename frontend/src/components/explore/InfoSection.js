import React from 'react'
import { Container, Button } from 'react-bootstrap'
import { useAccount } from 'wagmi';
import SignInButton from '../authentication/SignInButton';


function InfoSection() {

    // constants
    const { isConnected } = useAccount();


    // render
    return (
        <Container fluid className="p-2 p-sm-5">
            <div className="border info-container border p-4 d-flex justify-content-center align-item-center">
                <div className='w-75 p-1 p-sm-3'>
                    <h1 className="mb-2">KEEP UP!</h1>
                    <h4 className="">
                        Follow your <span className="primary-color"><strong>web3</strong></span> frens, influenceoors, and total randos!
                    </h4>
                    <h4 className="mb-4">
                        Keep them in the loop by sharing your latest.
                    </h4>
                    {!isConnected &&
                        <SignInButton
                            buttonText="Get Started"
                        />}
                </div>
            </div>
        </Container>
    )
}

export default InfoSection
