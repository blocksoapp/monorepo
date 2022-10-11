import React, { useState } from 'react'
import { Row, Col, Image, Form } from 'react-bootstrap'
import Blockies from 'react-blockies';
import ProfileEnsAndAddress from '../../components/ProfileEnsAndAddress';

function CurrentPfp(props) {
    
    const [pfpUrl, setPfpUrl] = useState(props.pfp)

  
  return (
    <div className="mb-3">
        {/* Profile picture */}
        <Row className="justify-content-center text-center p-2">
                                    <Col className="col-auto">
                                        {pfpUrl === null
                                        ? <Blockies
                                            seed={props.userAddress}
                                            size={16}
                                            scale={8}
                                            className="rounded-circle"
                                            color="#ff5412"
                                            bgColor="#ffb001"
                                            spotColor="#4db3e4"
                                        />
                                        : <Image
                                            src={pfpUrl}
                                            roundedCircle
                                            height="128px"
                                            width="128px"
                                            className="mb-1"
                                        />
                                        }
                                    </Col>
                                </Row>
                                 {/* Address and ENS */}
                                 <Row className="justify-content-center mt-2">
                                    <Col className="col-auto text-center">
                                        <Form.Label>
                                            <ProfileEnsAndAddress
                                                address={props.userAddress}
                                            />
                                        </Form.Label>
                                    </Col>
                                </Row>
    </div>
  )
}

export default CurrentPfp