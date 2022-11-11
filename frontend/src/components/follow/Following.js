import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Container } from 'react-bootstrap';
import Loading from '../ui/Loading'
import FollowNav from './FollowNav'
import FollowCard from './FollowCard'
import "./follow-custom.css"
import { apiGetFollowing } from '../../api'


function Following() {
  const [followingList, setFollowingList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)
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
        setError(true)
        console.log('couldnt fetch followingList')
      }
  } 

  useEffect(() => {
    fetchFollowing()

  
  }, [])
  

  return (
    <Container className="border p-0">
         <FollowNav address={urlInput}/>
            {isLoading ? <Loading/>
              :  <>
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
              </>}
    </Container>
  )
}


export default Following