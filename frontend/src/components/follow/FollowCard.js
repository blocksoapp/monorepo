import React, { useContext, useEffect } from 'react'
import { Container, Image, Button, Badge } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import EnsAndAddress from '../EnsAndAddress'
import Pfp from '../Pfp'
import { FollowContext } from '../../contexts/FollowContext'
import { getCookie, baseAPI } from '../../utils'


function FollowCard(props) {

    const { setProfileData, profileData, setProfileDataLoading } = useContext(FollowContext)
    const navigate = useNavigate()

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
            setProfileData({
                ...profileData,
                numFollowers: profileData["numFollowers"] - 1,
                followedByMe: false
            });
        }
    }

  return (
    <span>
        <div key={props.index} className="d-flex red-border">
                <Pfp
                height="80px"
                width="80px"
                imgUrl={props.imgUrl}
                address={props.address}
                fontSize=".9rem"
                onClick={() => navigate(`/${props.address}/profile`)}
                />
                <div className='blue-border flex-grow-1 p-0 align-items-center'>
                    <div className='d-flex justify-content-between red-border'>
                        <div className='d-flex flex-column border'>
                            <EnsAndAddress address={props.address} className='fw-bold fs-5 link-style' onClick={() => navigate(`/${props.address}/profile`)}/>
                            <Badge className='fs-6 bg-light text-dark'>{props.numFollowers} {props.numFollowers === 1 ? 'follower' : 'followers'} </Badge>
                        </div>
                        <div>
                            {props.followedByMe ? <Button className="btn-outline-dark" onClick={handleUnfollow} >Following</Button>
                            : <Button className="btn-dark" onClick={handleFollow}>Follow</Button> }
                        </div>
                    </div>
                    <div>
                        {props.bio && <p className='fs-6'>{props.bio}</p>}
                    </div>
                </div>
        </div>
    </span>
   
  )
}

export default FollowCard