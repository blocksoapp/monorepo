import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Col, Row } from 'react-bootstrap'
import PfpResolver from "../PfpResolver";


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
            {/* profile pic */}
            <PfpResolver
                imgUrl={data['image']}
                height="256px"
                width="256px"
                fontSize="1.75rem"
            />
            <div className="mt-3">
                <h4>{data['name']}</h4>
            </div>
            {data['description'] &&
             <div className="pt-3 ps-5 pe-5">
                 <p>{data['description']}</p>
             </div>
            }
            <Row className="justify-content-center mt-3 mb-3">
                <Col className="col-auto">
                    <h5>
                        <Badge bg="secondary">
                            {data['numFollowers']}
                            {data['numFollowers'] === 1 ?
                                " Follower" : " Followers"}
                        </Badge>
                    </h5>
                </Col>
                <Col className="col-auto">
                    <h5>
                        <Badge bg="secondary">
                            {data['numFollowing']} Following
                        </Badge>
                    </h5>
                </Col>
            </Row>
    </div>
  )
}


export default FeedThumbnail;
