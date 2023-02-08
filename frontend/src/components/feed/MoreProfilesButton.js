import React from 'react'
import { Alert, Button, Col, Container, Row } from "react-bootstrap";

function MoreProfilesButton({retryAction}) {
  return (
    <Container>
        <Row className='mt-2'>
            <Col xs={12}>
                    <Button
                        size='md'
                        variant='primary'
                        className='align-self-center'
                        onClick={retryAction}
                    >
                        Show More
                    </Button>
            </Col>
        </Row>
    </Container>
  )
}

export default MoreProfilesButton;
