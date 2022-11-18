import React, { useState, useEffect } from 'react'
import { Container, Button, Badge, Card, Col, Row } from 'react-bootstrap'
import { json, useNavigate } from 'react-router-dom'
import PfpResolver from '../PfpResolver'
import ClickableEnsAndAddress from '../ClickableEnsAndAddress'
import { apiPostFollow, apiPostUnfollow, apiGetProfile } from '../../api'
import './follow-custom.css'


function FollowCard2(props) {

    const navigate = useNavigate()
    const [buttonMsg, setButtonMsg] = useState('Following')
    const [profileData, setProfileData] = useState({})
    const [profileDataLoading, setProfileDataLoading] = useState(false)
    const [readMore, setReadMore] = useState(false)

    const handleFollow = async () => {
        const resp = await apiPostFollow(props.address)
        if (resp.ok) {
            setButtonMsg('Following')
            setProfileData({
                ...profileData,
                numFollowers: profileData["numFollowers"] + 1,
                followedByMe: true
            });
        }
    }

    const handleUnfollow = async () => {
        const resp = await apiPostUnfollow(props.address)
        if (resp.ok) {
            setButtonMsg('Follow')
            setProfileData({
                ...profileData,
                numFollowers: profileData["numFollowers"] - 1,
                followedByMe: false
            });
        } else if (!resp.ok) {
            console.error(resp.error)
        }
    }

    const fetchProfile = async () => {
        setProfileDataLoading(true);
        const resp = await apiGetProfile(props.address)
        if (resp.ok) {
            var data = await resp.json();
            setProfileData(data);
            setProfileDataLoading(false);
        }
        else {
            console.error(resp);
            setProfileDataLoading(false);
        }
    }

    const navigateProfile = () => {
        navigate(`/${props.address}/profile`)
      }

    // Hover On and Off Button Text Change
    const handleHoverOn = () => {
        if(buttonMsg === 'Follow') return
        setButtonMsg('Unfollow')
    }
    const handleHoverOff = () => {
        if(buttonMsg === 'Follow') return
        setButtonMsg('Following')
    }

    // Button Logic
    const handleButtonDisplayed = () => {
        if(profileData.followedByMe === true) {
            return <Button 
            className='outline-primary'
            onClick={handleUnfollow}
            onMouseEnter={handleHoverOn}
            onMouseLeave={handleHoverOff}
            >{buttonMsg}</Button>
        } else  {
            return <Button onClick={handleFollow} className='btn-primary'>Follow</Button>
        }
    }

    // shorten bio
    const abbrBio = (bio) => {
        if(bio.length > 200) {
            if(readMore === false) {
                return <div>
                        {bio.substr(0,200) + '...'} 
                        <span className="link-style" onClick={() => setReadMore(true)}> read more</span>
                    </div>
            } else if (readMore === true) {
                return <div>
                            {bio} 
                        </div>
            }
        } else return bio
}

    // Fetch profile data
    useEffect(() => {

        fetchProfile()
       
    }, [])

  return (
       <Container id={props.index} className="yellow-border">
            <Row className="justify-content-center">
                <Col xs={12} lg={8} className='red-border'>
                    <Card className="">
                            <Card.Header>
                                <Row className='align-items-end'>
                                    <Col className='blue-border col-auto'>
                                        <PfpResolver
                                            address={props.address}
                                            imgUrl={props.imgUrl}
                                            height="100px"
                                            width="100px"
                                            fontSize="1rem"
                                            onClick={navigateProfile}
                                            className="pointer d-flex justify-content-center"
                                        />
                                    </Col>
                                    <Col className='col-auto border d-flex'>
                                            <Card.Text>
                                                    <ClickableEnsAndAddress address={props.address} className='fs-5 primary-color-hover pointer' onClick={navigateProfile}/>                                
                                                    <Badge className='text-dark bg-light '>{props.numFollowers} {props.numFollowers === 1 ? 'follower' : 'followers'} </Badge>
                                            </Card.Text>
                                            {handleButtonDisplayed()}
                                        {/* <Row className="green-border align-items-center">
                                            <Col className="d-flex flex-column align-items-lg-start">
                                                <ClickableEnsAndAddress address={props.address} className='fs-5 primary-color-hover pointer' onClick={navigateProfile}/>  
                                                <Badge className='text-dark bg-light '>{props.numFollowers} {props.numFollowers === 1 ? 'follower' : 'followers'} </Badge>
                                            </Col>
                                            <Col className='d-flex justify-content-end'>
                                                {handleButtonDisplayed()}
                                            </Col>
                                        </Row>
                                        {props.bio && <p className='fs-6 pt-1 bio'>{abbrBio(props.bio)}</p>} */}
                                    </Col>
                                    {props.bio && <Card.Text className='fs-6 pt-1 bio'>{abbrBio(props.bio)}</Card.Text>} 
                                </Row>
                            </Card.Header>
                    </Card>
                </Col>
            </Row>
       </Container>
   
  )
}

export default FollowCard2
