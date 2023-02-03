import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Col, Row } from 'react-bootstrap'
import FeedDetails from './FeedDetails'


function FeedThumbnail({data}) {
    // constants
    const navigate = useNavigate();

    // state

    // functions

    /*
     * Navigate to feed profile.
     */
    const handleClick = () => {
        navigate(`/feeds/${data['id']}/`)
    }

    // effects


  return (
    <div className="card-body d-flex flex-column justify-content-center p-3 mb-5 align-items-center rounded border"
        onClick={handleClick}
        style={{ cursor: "pointer"}} 
    >
        <FeedDetails feed={data} />
    </div>
  )
}


export default FeedThumbnail;
