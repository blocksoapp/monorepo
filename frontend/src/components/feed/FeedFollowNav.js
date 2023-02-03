import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import EnsAndAddress from '../EnsAndAddress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'


function FeedFollowNav({feedId}) {
  const navigate = useNavigate()

  const navigateFeed = () => {
    navigate(`/feeds/${feedId}`);
  }

  return (
        <>
              <div className='d-flex py-3 px-sm-5 border-bottom align-items-center'>
                <div className='px-2'>
                  <FontAwesomeIcon icon={faArrowLeft} onClick={navigateFeed} className="fa-lg arrow pointer" />
                </div>
                <div className='px-1'>
                  <span className='pointer fs-4' onClick={navigateFeed}>Back</span> 
                </div>
              </div>
        </>
  )
}

export default FeedFollowNav;
