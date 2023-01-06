import React, { useState, useEffect, useContext } from 'react';
import { Alert, Col, Container, Row } from 'react-bootstrap';
import { erc721ABI, useContractRead } from 'wagmi';
import PfpResolver from "../../PfpResolver";
import ProfileEnsAndAddress from "./ProfileEnsAndAddress";


function ContractProfile({address, ensName}) {
    // constants
    const contractNameHook = useContractRead({
        addressOrName: address,
        contractInterface: erc721ABI,
        functionName: 'name'
    });

    // state
    const [name, setName] = useState("");
 
    // functions

    // effects
    useEffect(() => {
        if (contractNameHook.isLoading) return;
        if (contractNameHook.isError) {
            setName("Could not find contract name.");
        }
        if (contractNameHook.data) {
            setName(contractNameHook.data);
        }
    }, [contractNameHook]);


    return (
        <Container fluid>
            {/* User Info Section */}
            <Container className="border-bottom border-light">

                {/* Profile picture */}
                <Row className="justify-content-center">
                    <Col className="col-auto">
                        <PfpResolver
                            address={address}
                            height="256px"
                            width="256px"
                            fontSize="1.75rem"
                        />
                    </Col>
                </Row>

                {/* Address and ENS */}
                <Row className="justify-content-center mt-5">
                    <Col className="col-auto text-center">
                        <h4>
                            <ProfileEnsAndAddress
                                address={address}
                            />
                        </h4>
                    </Col>
                </Row>

                {/* feedback blurb */}
                <Row className="justify-content-center mt-5">
                    <Col xs={6}>
                        <Alert variant="warning" className="lh-1">
                            <p>This is a contract profile.</p>
                            <p>Let us know what info would be helpful to display here!</p>
                            <p>Contract name: <strong>{name}</strong></p>
                            <a
                                href={`https://etherscan.io/address/${address}`}
                                target="_blank"
                                rel="noopener noreferrer" 
                            >
                                View on Etherscan
                            </a>
                        </Alert>
                    </Col>
                </Row>
            </Container>
        </Container>
    )
}

export default ContractProfile;
