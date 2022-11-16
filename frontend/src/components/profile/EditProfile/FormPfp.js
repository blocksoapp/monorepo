import React from 'react'
import { Row, Col, Button, Container } from 'react-bootstrap'
import ProfileEnsAndAddress from '../ViewProfile/ProfileEnsAndAddress';
import Pfp from '../../Pfp';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons'


function FormPfp({ pfp, address, removePfp, pfpPreview, isPfpRemoved, isConnected }) {

   

  return (
    <Container className="p-2 d-flex">
        {/* Profile picture */}
        <Row className="align-self-center">
            <Col className="d-flex flex-column justify-content-center align-items-center">
                <Pfp
                    height="128px"
                    width="128px"
                    imgUrl={pfp}
                    address={address}
                    fontSize="1rem"
                />
                {/* Address and ENS */}
                <ProfileEnsAndAddress
                    address={address}
                />

                { pfpPreview || isPfpRemoved ? 
                <Button className="btn-sm" variant="success" type="submit" disabled={!isConnected} >
                    Save Changes
                </Button> :
                '' }
            </Col>
        </Row>

        <Row className="align-self-start">
            {pfp !== ''  ? 
                <span className="delete-icon " variant="outline-dark" onClick={removePfp}>
                      <FontAwesomeIcon icon={faTrash} />
                </span>:
                <span></span>} 
        </Row>
             
    </Container>
  )
}


export default FormPfp;
