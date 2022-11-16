import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import Loading from '../ui/Loading'
import FollowNav from './FollowNav'
import FollowCard from './FollowCard'
import "./follow-custom.css"
import { apiGetFollowers } from '../../api'


function Followers() {

  const [followers, setFollowers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [active, setActive] = useState(true)
  const [error, setError] = useState(false)
  const { urlInput } = useParams();
  
  const fetchFollowers = async () => {
      setIsLoading(true)
      const resp = await apiGetFollowers(urlInput)
      if(resp.ok) {
        const json = await resp.json()
        setFollowers(json.results)
        setIsLoading(false)
      } else if (!resp.ok) {
        setIsLoading(false)
        setError(true)
        console.log('couldnt fetch followers')
      }
  } 

  useEffect(() => {
    fetchFollowers()
  
  }, [])
  
 
  return (
    <Container className="border p-0">
        <FollowNav address={urlInput} active={active}/>
       {isLoading ? <Loading/>
        :  <>
        {(followers === undefined || followers.length === 0)
        ? <p className="fs-2 text-center align-item-center p-2">No results.</p>
        : followers.map( (follower, index) => {
          return (
                <FollowCard
                key={index}
                imgUrl={follower.profile.image}
                address={follower.address}
                bio={follower.profile.bio}
                followedByMe={follower.profile.followedByMe}
                numFollowers={follower.profile.numFollowers}
                />
          )})}
          </>}
    </Container>
  )
}

export default Followers