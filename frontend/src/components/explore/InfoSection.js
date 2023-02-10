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
                    <h1 className="mb-0">FIND ALPHA.</h1>
                    <h1 className="mb-2">SHARE ALPHA.</h1>
                    <ol className="py-4">
                        <h3 className="mb-3"><li>Sign in.</li></h3>
                        <h3 className="mb-3"><li>Follow users and feeds.</li></h3>
                        <h3><li>Tag your friends on interesting posts!</li></h3>
                    </ol>

                    {!isConnected &&
                        <SignInButton />}
                </div>
            </div>
        </Container>
    )
}

export default InfoSection
