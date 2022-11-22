import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Container } from 'react-bootstrap';
import FollowNav from './FollowNav'
import FollowCard from './FollowCard'
import "./follow-custom.css"
import { apiGetFollowing } from '../../api'
import FollowPlaceholder from './FollowPlaceholder';
import FollowError from './FollowError';


function Following() {
  const [followingList, setFollowingList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [followingError, setFollowingError] = useState(false)
  const { urlInput } = useParams();
  
  const fetchFollowing = async () => {
      setIsLoading(true)
      const resp = await apiGetFollowing(urlInput)
      if(resp.ok) {
        const json = await resp.json()
        setFollowingList(json.results)
        setIsLoading(false)
      } else if (!resp.ok) {
        setIsLoading(false)
        setFollowingError(true)
        console.log('couldnt fetch followingList')
      }
  } 

  useEffect(() => {
    fetchFollowing()

  
  }, [])
  

  return (
    <Container className="border p-0">
         <FollowNav address={urlInput}/>
            {isLoading 
              ? <FollowPlaceholder/>
              : followingError 
                ? <FollowError retryAction={fetchFollowing} />
                : <>
                  {(followingList === undefined || followingList.length === 0)
                    ? <p className="fs-2 text-center align-item-center p-2">No results.</p>
                    : followingList.map( (following, index) => {
                      return (
                            <FollowCard
                            key={index}
                            imgUrl={following.image}
                            address={following.address}
                            bio={following.bio}
                            followedByMe={following.followedByMe}
                            numFollowers={following.numFollowers}
                            />
                      )}) }
                    </> }
    </Container>
  )
}


export default Following
