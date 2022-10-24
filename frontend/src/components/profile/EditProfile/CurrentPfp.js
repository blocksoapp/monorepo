import React from 'react'
import { Row, Col, Form, Button } from 'react-bootstrap'
import ProfileEnsAndAddress from '../ViewProfile/ProfileEnsAndAddress';
import Pfp from '../../Pfp';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons'


function CurrentPfp({ pfp, address, removePfp }) {

   

  return (
    <div className="">
        {/* Profile picture */}
        <Row className="justify-content-center text-center p-2">
            <Col className="col-auto d-flex">
                <Pfp
                    height="128px"
                    width="128px"
                    imgUrl={pfp}
                    address={address}
                    fontSize="1rem"
                />
                {pfp !== '' ? 
                <span className="delete-icon align-self-start" variant="outline-dark" onClick={removePfp}>
                      <FontAwesomeIcon icon={faTrash} />
                </span>:
                <div className="align-self-start"></div>}
                
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
