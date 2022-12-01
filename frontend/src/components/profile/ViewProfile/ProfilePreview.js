import React, { useEffect, useState } from 'react'
import { Container, Badge, Alert } from 'react-bootstrap'
import EnsAndAddress from '../../EnsAndAddress'
import PfpResolver from '../../PfpResolver'

function ProfilePreview(props) {

  return (
    <div>
         {
          props.previewLoading ? <p>Loading...</p>
            : props.previewData 
              ? <div>
                  <PfpResolver
                  address={props.address}
                  imgUrl={props.imgUrl}
                  height="100px"
                  width="100px"
                  fontSize="0.8rem"
                  className="pointer d-flex justify-content-center mt-2"
                  />
                  <div className='text-center'>
                    <EnsAndAddress address={props.address}/>
                    <div className='d-flex justify-content-center'>
                        <Badge className='text-dark bg-light align-self-sm-start align-self-center'>{props.numFollowers} {props.numFollowers === 1 ? 'follower' : 'followers'} </Badge>
                        <Badge className='text-dark bg-light align-self-sm-start align-self-center'>{props.numFollowing} following </Badge>
                    </div>
                    <p>{props.bio}</p>
                  </div>
                </div>
                : <Alert className="text-center mb-0 fs-6" variant="danger">No profile to preview.</Alert>
         }
            
    </div>
  )
}

export default ProfilePreview