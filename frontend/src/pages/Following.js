import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Container } from 'react-bootstrap';
import { baseAPI } from '../utils'
import Loading from '../components/ui/Loading'
import FollowNav from '../components/follow/FollowNav'
import FollowCard from '../components/follow/FollowCard'
import "../components/follow/follow-custom.css"


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
    <Container className="border p-0 h-min-100 follow-container">
         <FollowNav address={urlInput}/>
             <>
                  {(followingList === undefined || followingList.length === 0)
                  ? <p className="fs-2 text-center align-item-center p-2">No results.</p>
                  : followingList.map( (following, index) => {
                    return (
                          <FollowCard
                          index={index}
                          imgUrl={following.profile.image}
                          address={following.address}
                          bio={following.profile.bio}
                          followedByMe={following.profile.followedByMe}
                          numFollowers={following.profile.numFollowers}
                          />
                    )}) }
              </>
    </Container>
  )
}


export default Following