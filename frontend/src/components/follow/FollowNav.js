import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Container } from 'react-bootstrap'
import EnsAndAddress from '../EnsAndAddress'

function FollowNav(props) {
  const navigate = useNavigate()

  const navigateFollowing = () => {
   navigate(`/${props.address}/profile/following`)
  }

  const navigateFollowers = () => {
    navigate(`/${props.address}/profile/followers`)
   }

  return (
        <Container className='d-flex flex-column green-border'>
          <div>
            <span>{props.address}</span>
          </div>
            <div className='d-flex w-100 text-center red-border'>
                <Button className='w-50 border' variant="outline-dark" onClick={navigateFollowers}>Followers</Button>
                <Button className={props.followingStyle} variant="outline-dark" onClick={navigateFollowing}>Following</Button>
                {/* <span className={props.followingStyle}>Following</span> */}
            </div>
        </Container>
  )
}

export default FollowNav