import React from 'react'
import { Container } from 'react-bootstrap'
import EnsAndAddress from '../EnsAndAddress'

function FollowNav(props) {
  return (
        <Container className='d-flex flex-column border'>
            <div>
                <EnsAndAddress
                address={props.address}/>
            </div>
            <div className='d-flex w-100 text-center'>
                <h1 className='border w-50'>Followers</h1>
                <h1 className='border w-50'>Following</h1>
            </div>
        </Container>
  )
}

export default FollowNav