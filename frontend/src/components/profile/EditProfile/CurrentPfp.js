import React from 'react'
import { Row, Col, Form } from 'react-bootstrap'
import ProfileEnsAndAddress from '../ViewProfile/ProfileEnsAndAddress';
import Pfp from '../../Pfp';


function CurrentPfp({ pfp, address }) {

  return (
    <div className="">
        {/* Profile picture */}
        <Row className="justify-content-center text-center p-2">
            <Col className="col-auto">
                <Pfp
                    height="128px"
                    width="128px"
                    imgUrl={pfp}
                    address={address}
                    fontSize="1rem"
                />
            </Col>
        </Row>
        {/* Address and ENS */}
        <Row className="justify-content-center mt-2">
            <Col className="col-auto text-center">
                <Form.Label>
                    <ProfileEnsAndAddress
                        address={address}
                    />
                </Form.Label>
            </Col>
        </Row>
    </div>
  )
}


export default CurrentPfp;
