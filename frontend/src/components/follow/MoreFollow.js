import React from 'react'
import { Alert, Button, Col, Container, Row } from "react-bootstrap";

function MoreFollow(props) {
  return (
    <Container>
        <Row className='justify-content-center p-5'>
            <Col xs={10} lg={6} className='text-center'>
                    <Button
                        size='md'
                        variant='primary'
                        className='align-self-center'
                        onClick={props.action}
                    >
                        Load More
                    </Button>
            </Col>
        </Row>
    </Container>
  )
}

export default MoreFollow