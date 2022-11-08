import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button, Container } from 'react-bootstrap'
import EnsAndAddress from '../EnsAndAddress'

function FollowNav(props) {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeFollowerTab, setActiveFollowerTab] = useState()

  const navigateFollowing = () => {
   navigate(`/${props.address}/profile/following`)
  }

  const navigateFollowers = () => {
    navigate(`/${props.address}/profile/followers`)
   }

  const navigateProfile = () => {
    navigate(`/${props.address}/profile`)
  }

  useEffect(() => {
    if(location.pathname.includes('followers')) {
      console.log('on followers page')
      const followersTab = document.getElementById('followersTab')
      followersTab.classList.add('link-active')
    } else if (location.pathname.includes('following')) {
      console.log('on following page')
      const followingTab = document.getElementById('followingTab')
      followingTab.classList.add('link-active')
    } else return
  }, [])
  
  //className={`w-50 border fw-bold p-2 ${props.active ? 'link-active' : ''}`} 

  return (
        <div className=''>
              <div className='p-3'>
                <Button className="btn-sm" variant="outline-dark" onClick={navigateProfile}>Back</Button> <br/>
                <span className='fw-bold fs-5'><EnsAndAddress address={props.address}/></span> 
              </div>
            <div className='d-flex text-center'>
                <span className='w-50 border fw-bold p-2' onClick={navigateFollowers} id="followersTab">Followers</span>
                <span className='w-50 border fw-bold p-2' onClick={navigateFollowing} id="followingTab">Following</span>
            </div>
        </div>
  )
}

export default FollowNav