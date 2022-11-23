import React from 'react'
import { Container, Badge } from 'react-bootstrap'
import EnsAndAddress from '../../EnsAndAddress'
import PfpResolver from '../../PfpResolver'

function ProfilePreview(props) {
  return (
    <Container className=''>
          <PfpResolver
                    address={props.address}
                    imgUrl={props.imgUrl}
                    height="100px"
                    width="100px"
                    fontSize="0.8rem"
                    className="pointer d-flex justify-content-center mt-2"
            />
            <div>
            <EnsAndAddress address={props.address}/>
                <div className='d-flex'>
                    <Badge className='text-dark bg-light align-self-sm-start align-self-center'>{props.numFollowers} {props.numFollowers === 1 ? 'follower' : 'followers'} </Badge>
                    <Badge className='text-dark bg-light align-self-sm-start align-self-center'>{props.numFollowing} following </Badge>
                </div>
            <p>{props.abbrBio(props.bio)}</p>
            </div>
            
    </Container>
  )
}

export default ProfilePreview