import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import { UseFetch } from '../../hooks/useFetch'
import { baseAPI } from '../../utils'
import FollowNav from './FollowNav'
import { UserContext } from '../../contexts/UserContext'
import Loading from '../ui/Loading'
import FollowCard from './FollowCard'

function Followers() {

  const [followers, setFollowers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  //const { data, isLoading, error } = UseFetch()
  const { state } = useLocation()
  
  const fetchFollowers = async () => {
      setIsLoading(true)
      const url = `${baseAPI}/${state.address}/followers/`
      const res = await fetch(url, {
          method: 'GET',
          credentials: 'include'
      })
      console.log("response: ", res)
      if(res.ok) {
        const json = await res.json()
        console.log("json: ", json)
        setFollowers(json.results)
      } else return
      setIsLoading(false)
  } 

  useEffect(() => {
    fetchFollowers()
  
  }, [])
  
  
  if (isLoading) {
    return <Loading/>
  }

  return (
    <Container className="border w-auto">
        <FollowNav
        address={state.address}/>
             <Container className="mt-3">
                  {followers.map( (follower, index) => {
                    return (
                          <FollowCard
                          index={index}
                          imgUrl={follower.profile.image}
                          address={follower.address}
                          bio={follower.profile.bio}
                          followedByMe={follower.profile.followedByMe}
                          />
                    )})}
              </Container>
    </Container>
  )
}

export default Followers