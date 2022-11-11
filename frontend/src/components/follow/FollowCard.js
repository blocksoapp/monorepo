import React, { useState, useEffect } from 'react'
import { Button, Badge } from 'react-bootstrap'
import { json, useNavigate } from 'react-router-dom'
import EnsAndAddress from '../EnsAndAddress'
import Pfp from '../Pfp'
import { getCookie, baseAPI } from '../../utils'
import ClickableEnsAndAddress from '../ClickableEnsAndAddress'


function FollowCard(props) {

    const navigate = useNavigate()
    const [buttonMsg, setButtonMsg] = useState('Following')
    const [profileData, setProfileData] = useState({})
    const [profileDataLoading, setProfileDataLoading] = useState(false)
    const [readMore, setReadMore] = useState(false)

    const handleFollow = async () => {
        const url = `${baseAPI}/${props.address}/follow/`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
            'X-CSRFTOKEN': getCookie('csrftoken')
            },
            credentials: 'include'
        });
        if (res.ok) {
            console.log('follow success')
            setButtonMsg('Following')
            setProfileData({
                ...profileData,
                numFollowers: profileData["numFollowers"] + 1,
                followedByMe: true
            });
        }
    }

    const handleUnfollow = async () => {
        const url = `${baseAPI}/${props.address}/follow/`;
        const res = await fetch(url, {
            method: 'DELETE',
            headers: {
            'X-CSRFTOKEN': getCookie('csrftoken')
            },
            credentials: 'include'
        });
        if (res.ok) {
            console.log('unfollow success')
            setButtonMsg('Follow')
            setProfileData({
                ...profileData,
                numFollowers: profileData["numFollowers"] - 1,
                followedByMe: false
            });
        }
    }

    const fetchProfile = async () => {
        const url = `${baseAPI}/${props.address}/profile/`;
        setProfileDataLoading(true);
        const res = await fetch(url, {
            method: 'GET',
            credentials: 'include'
        });
        if (res.ok) {
            var data = await res.json();
            setProfileData(data);
            setProfileDataLoading(false);
        }
        else {
            console.error(res);
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
        const unfollowBtn = document.getElementById('unfollowBtn')
        unfollowBtn.classList.add('btn-danger')
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
            id="unfollowBtn"
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
        <div key={props.index} className="d-flex py-3 px-sm-5 light-hover">
                <Pfp
                height="90px"
                width="90px"
                imgUrl={props.imgUrl}
                address={props.address}
                fontSize=".9rem"
                onClick={navigateProfile}
                className="pointer"
                />
                <div className='flex-grow-1 p-2 align-items-center'>
                    <div className='d-flex justify-content-between'>
                        <div className='d-flex flex-column'>
                            <ClickableEnsAndAddress address={props.address} className='fs-5 primary-color-hover pointer' onClick={navigateProfile}/>
                            <Badge className='text-dark bg-light text-start align-self-start'>{props.numFollowers} {props.numFollowers === 1 ? 'follower' : 'followers'} </Badge>
                        </div>
                        <div className='align-self-center'>
                           {handleButtonDisplayed()}
                        </div>
                    </div>
                    <div>
                        {props.bio && <p className='fs-6 pt-1'>{abbrBio(props.bio)}</p>}
                    </div>
                </div>
        </div>
   
  )
}

export default FollowCard

/* {buttonMsg === 'Following' 
? <Button 
    variant="outline-primary" 
    onClick={handleUnfollow} id="Followed" 
    onMouseEnter={handleHoverOn}
    onMouseLeave={handleHoverOff}
    >
    {buttonMsg}</Button>
: <Button className="btn-primary" onClick={handleFollow} id="notFollowed" >{buttonMsg}</Button> } */