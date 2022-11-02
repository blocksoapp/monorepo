import React from 'react'
import { Container, Image, Button } from 'react-bootstrap'
import EnsAndAddress from '../EnsAndAddress'
import Pfp from '../Pfp'

function FollowCard(props) {
  return (
    <Container key={props.index} className="d-flex red-border w-auto">
        <Pfp
        height="80px"
        width="80px"
        imgUrl={props.imgUrl}
        address={props.address}
        fontSize=".8rem"
        />
        <Container className='blue-border p-2 d-flex-inline flex-column align-items-center'>
            <div className='d-flex justify-content-between'>
                <div>
                    <EnsAndAddress address={props.address}/>
                    {props.followedByYou ? <span className='border p-2'>Followed By You</span> : <span></span>}
                </div>
                <div>
                    <Button className="btn-dark">Follow</Button>
                </div>
            </div>
            <div>
                {props.bio && <p>{props.bio}</p>}
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias quibusdam iste incidunt aliquam quae neque dignissimos nihil sint autem eligendi, molestias consequatur dolor, asperiores libero, ullam similique. Corporis, non aut?</p>
            </div>
        </Container>
    </Container>
  )
}

export default FollowCard