import React, { useState } from 'react'
import { Row, Col, Image, Form } from 'react-bootstrap'
import ProfileEnsAndAddress from '../ViewProfile/ProfileEnsAndAddress';
import Pfp from '../../Pfp';


function CurrentPfp({ pfp, userAddress }) {

  return (
    <div className="mb-3">
        {/* Profile picture */}
        <Row className="justify-content-center text-center p-2">
            <Col className="col-auto">
                <Pfp
                    height="128px"
                    width="128px"
                    imgUrl={pfp}
                    address={userAddress}
                    fontSize="1rem"
                />
            </Col>
        </Row>
        {/* Address and ENS */}
        <Row className="justify-content-center mt-2">
            <Col className="col-auto text-center">
                <Form.Label>
                    <ProfileEnsAndAddress
                        address={userAddress}
                    />
                </Form.Label>
            </Col>
        </Row>
    </div>
  )
}


export default CurrentPfp;
