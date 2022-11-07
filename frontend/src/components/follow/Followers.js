import React, { useState, useEffect, useContext } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import { UseFetch } from '../../hooks/useFetch'
import { useEnsAddress, useEnsName } from 'wagmi'
import { baseAPI } from '../../utils'
import FollowNav from './FollowNav'
import Loading from '../ui/Loading'
import FollowCard from './FollowCard'

function Followers() {

  const [followers, setFollowers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
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
    <Container className="border w-auto">
        <FollowNav
        address={urlInput}
        />
             <Container className="mt-3">
                  {followers.map( (follower, index) => {
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
              </Container>
    </Container>
  )
}

export default Followers