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

  const navigateProfile = () => {
    navigate(`/${props.address}/profile`)
  }

  return (
        <div className='green-border'>
              <div className='p-3'>
                <Button className="btn-sm" variant="outline-dark" onClick={navigateProfile}>Back</Button> <br/>
                <span className='fw-bold fs-5'><EnsAndAddress address={props.address}/></span> 
              </div>
            <div className='d-flex text-center red-border'>
                <Button className='w-50 border fw-bold p-2' variant="outline-dark" onClick={navigateFollowers}>Followers</Button>
                <Button className='w-50 border fw-bold p-2' variant="outline-dark" onClick={navigateFollowing}>Following</Button>
                {/* <span className={props.followingStyle}>Following</span> */}
            </div>
        </div>
  )
}

export default FollowNav