import React, { useState, useContext, useEffect } from 'react'
import { Container, Image, Button, Badge } from 'react-bootstrap'
import { json, useNavigate } from 'react-router-dom'
import EnsAndAddress from '../EnsAndAddress'
import Pfp from '../Pfp'
import { FollowContext } from '../../contexts/FollowContext'
import { getCookie, baseAPI } from '../../utils'
import { UserContext } from '../../contexts/UserContext'


function FollowCard(props) {

    const navigate = useNavigate()
    const [buttonMsg, setButtonMsg] = useState('')
    const [profileData, setProfileData] = useState({})
    const [profileDataLoading, setProfileDataLoading] = useState(false)

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
            console.log('followed')
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
            console.log('unfollowed')
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

    // Fetch profile data / set button text
    useEffect(() => {
    fetchProfile()

    if(props.followedByMe === true) {
        setButtonMsg('Following')
    } else {
        setButtonMsg('Follow')
    }

    }, [])


      
      

      

  return (
        <div key={props.index} className="d-flex p-3">
                <Pfp
                height="80px"
                width="80px"
                imgUrl={props.imgUrl}
                address={props.address}
                fontSize=".9rem"
                onClick={() => navigate(`/${props.address}/profile`)}
                />
                <div className='flex-grow-1 p-2 align-items-center'>
                    <div className='d-flex justify-content-between'>
                        <div className='d-flex flex-column'>
                            <EnsAndAddress address={props.address} className='fw-bold fs-5 link-style' onClick={navigateProfile}/>
                            <Badge className='text-dark text-start align-self-start'>{props.numFollowers} {props.numFollowers === 1 ? 'follower' : 'followers'} </Badge>
                        </div>
                        <div className='align-self-center'>
                            {buttonMsg === 'Following' ? <Button className="btn-outline-dark" onClick={handleUnfollow} >{buttonMsg}</Button>
                            : <Button className="btn-dark" onClick={handleFollow}>{buttonMsg}</Button> }
                        </div>
                    </div>
                    <div>
                        {props.bio && <p className='fs-6 pt-1'>{props.bio}</p>}
                    </div>
                </div>
        </div>
   
  )
}

export default FollowCard