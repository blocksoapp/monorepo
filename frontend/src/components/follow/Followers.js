import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import { baseAPI } from '../../utils'
import FollowNav from './FollowNav'
import Loading from '../ui/Loading'
import FollowCard from './FollowCard'

function Followers() {

  const [followers, setFollowers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [active, setActive] = useState(true)
  const [error, setError] = useState(false)
  const { urlInput } = useParams();
  
  const fetchFollowers = async () => {
      setIsLoading(true)
      const url = `${baseAPI}/${urlInput}/followers/`
      const res = await fetch(url, {
          method: 'GET',
          credentials: 'include'
      })
      console.log("response: ", res)
      if(res.ok) {
        const json = await res.json()
        console.log("json: ", json)
        setFollowers(json.results)
        setIsLoading(false)
      } else if (!res.ok) {
        setIsLoading(false)
        setError(true)
        console.log('couldnt fetch followers')
      }
  } 

  useEffect(() => {
    fetchFollowers()
  
  }, [])
  
  
  if (isLoading) {
    return <Loading/>
  }

  return (
    <Container className="border p-0 h-min-100">
        <FollowNav address={urlInput} active={active}/>
        <div className="mt-3 ">
            {(followers === undefined || followers.length === 0)
            ? <p className="fs-2 text-center align-item-center p-2">User does not have any followers.</p>
            : followers.map( (follower, index) => {
              return (
                    <FollowCard
                    index={index}
                    imgUrl={follower.profile.image}
                    address={follower.address}
                    bio={follower.profile.bio}
                    followedByMe={follower.profile.followedByMe}
                    numFollowers={follower.profile.numFollowers}
                    />
              )})}
        </div>
    </Container>
  )
}

export default Followers