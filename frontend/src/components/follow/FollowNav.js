import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import EnsAndAddress from '../EnsAndAddress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import ClickableEnsAndAddress from '../ClickableEnsAndAddress';

function FollowNav(props) {
  const navigate = useNavigate()
  const location = useLocation()

  const navigateProfile = () => {
    navigate(`/${props.address}/profile`)
  }

  return (
        <>
              <div className='d-flex py-3 px-sm-5 border-bottom'>
                <div className='px-4 align-self-center'>
                  <FontAwesomeIcon icon={faArrowLeft} onClick={navigateProfile} className="fa-lg primary-color-hover pointer" />
                </div>
                <div className='flex-grow-1 px-4 align-self-center'>
                  <span><ClickableEnsAndAddress address={props.address} onClick={navigateProfile} className='pointer fs-4 primary-color-hover'/></span> 
                </div>
              </div>
        </>
  )
}

export default FollowNav

