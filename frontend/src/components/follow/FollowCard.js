import React, { useState, useEffect } from 'react'
import { Button, Badge } from 'react-bootstrap'
import { json, useNavigate } from 'react-router-dom'
import PfpResolver from '../PfpResolver'
import ClickableEnsAndAddress from '../ClickableEnsAndAddress'
import { apiPostFollow, apiPostUnfollow, apiGetProfile } from '../../api'
import './follow-custom.css'


function FollowCard(props) {

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
        <div className="d-flex flex-sm-row flex-column align-items-sm-center py-sm-3 py-1 px-md-5 light-hover">
                <PfpResolver
                    address={props.address}
                    imgUrl={props.imgUrl}
                    height="90px"
                    width="90px"
                    fontSize="0.9rem"
                    onClick={navigateProfile}
                    className="pointer d-flex justify-content-center"
                />
                <div className='flex-grow-1 ps-4'>
                    <div className='follow-body'>
                        <div className='d-flex flex-column'>
                            <ClickableEnsAndAddress address={props.address} className='fs-5 primary-color-hover pointer' onClick={navigateProfile}/>
                            <Badge className='text-dark bg-light align-self-sm-start'>{props.numFollowers} {props.numFollowers === 1 ? 'follower' : 'followers'} </Badge>
                        </div>
                        <div className='align-self-center follow-btn'>
                           {handleButtonDisplayed()}
                        </div>
                    </div>
                    <div>
                        {props.bio && <p className='fs-6 pt-1 bio'>{abbrBio(props.bio)}</p>}
                    </div>
                </div>
        </div>
   
  )
}

export default FollowCard
