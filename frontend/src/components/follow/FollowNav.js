import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import EnsAndAddress from '../EnsAndAddress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'

function FollowNav(props) {
  const navigate = useNavigate()
  const location = useLocation()

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
                  <span className='fs-3 primary-color-hover'><EnsAndAddress address={props.address} onClick={navigateProfile}/></span> 
                </div>
              </div>
        </>
  )
}

export default FollowNav

