import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import EnsAndAddress from '../EnsAndAddress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'

function FollowNav(props) {
  const navigate = useNavigate()
  const location = useLocation()

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
      const followersTab = document.getElementById('followersTab')
      followersTab.classList.add('link-active')
    } else if (location.pathname.includes('following')) {
      const followingTab = document.getElementById('followingTab')
      followingTab.classList.add('link-active')
    } else return
  }, [])
  

  return (
        <>
              <div className='d-flex py-3 px-sm-5'>
                <div className='px-4 align-self-center'>
                  <FontAwesomeIcon icon={faArrowLeft} onClick={navigateProfile} className="fa-lg primary-color-hover" />
                </div>
                <div className='flex-grow-1 px-4 align-self-center'>
                  <span className='fw-bold fs-3 link-style'><EnsAndAddress address={props.address} onClick={navigateProfile}/></span> 
                </div>
              </div>
            <div className='d-flex text-center border-bottom'>
                <span className='w-50 fs-5 fw-bold p-3 light-hover' onClick={navigateFollowers} id="followersTab">Followers</span>
                <span className='w-50 fs-5 fw-bold p-3 light-hover' onClick={navigateFollowing} id="followingTab">Following</span>
            </div>
        </>
  )
}

export default FollowNav

