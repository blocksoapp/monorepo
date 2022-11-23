import React from 'react'
import EnsAndAddress from './EnsAndAddress'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import ProfilePreview from './profile/ViewProfile/ProfilePreview';

function ClickableEnsAndAddress(props) {
  return (
    // needs address, imgUrl
   
        <OverlayTrigger
            trigger={['hover', 'focus']}
            placement='auto-start'
            overlay={
              <Popover>
                <Popover.Body className='popover'>
                  <ProfilePreview
                  address={props.address}
                  imgUrl={props.imgUrl}
                  bio={props.bio}
                  abbrBio={props.abbrBio}
                  numFollowers={props.numFollowers}
                  numFollowing={props.numFollowing}
                  />
                </Popover.Body>
              </Popover>
            }
          >
          <span className={props.className} >
            <EnsAndAddress address={props.address}/>
          </span>
        </OverlayTrigger>
       
        
   
  )
}

export default ClickableEnsAndAddress