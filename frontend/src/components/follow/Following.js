import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Container } from 'react-bootstrap';
import Loading from '../ui/Loading';
import { baseAPI } from '../../utils'
import FollowNav from './FollowNav';
import FollowCard from './FollowCard';


function Following() {
  const [followingList, setFollowingList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)
  const { urlInput } = useParams();
  
  const fetchFollowing = async () => {
      setIsLoading(true)
      const url = `${baseAPI}/${urlInput}/following/`
      const res = await fetch(url, {
          method: 'GET',
          credentials: 'include'
      })
      console.log("response: ", res)
      if(res.ok) {
        const json = await res.json()
        console.log("json: ", json)
        setFollowingList(json.results)
        setIsLoading(false)
      } else if (!res.ok) {
        setIsLoading(false)
        setError(true)
        console.log('couldnt fetch followingList')
      }
  } 

  useEffect(() => {
    fetchFollowing()
  
  }, [])
  
  
  if (isLoading) {
    return <Loading/>
  }

  return (
    <Container className="border w-auto">
         <FollowNav
        address={urlInput}
        followerStyle='w-50 p-3'
        followingStyle='w-50 p-3'/>
             <Container className="mt-3">
                  {followingList.map( (following, index) => {
                    return (
                          <FollowCard
                          index={index}
                          imgUrl={following.profile.image}
                          address={following.address}
                          bio={following.profile.bio}
                          followedByMe={following.profile.followedByMe}
                          numFollowers={following.profile.numFollowers}
                          />
                    )})}
              </Container>
    </Container>
  )
}


export default Following