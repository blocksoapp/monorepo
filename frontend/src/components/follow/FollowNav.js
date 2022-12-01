import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import EnsAndAddress from '../EnsAndAddress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import ClickableEnsAndAddress from '../ClickableEnsAndAddress';

function FollowNav(props) {
  const navigate = useNavigate()

  const navigateProfile = () => {
    navigate(`/${props.address}/profile`)
  }

  return (
        <>
              <div className='d-flex py-3 px-sm-5 border-bottom justify-content-center align-items-center'>
                <div className='px-2'>
                  <FontAwesomeIcon icon={faArrowLeft} onClick={navigateProfile} className="fa-lg arrow pointer" />
                </div>
                <div className='px-1'>
                  <span><ClickableEnsAndAddress address={props.address} onClick={navigateProfile} className='pointer fs-4 primary-color-hover'/></span> 
                </div>
              </div>
        </>
  )
}

export default FollowNav

