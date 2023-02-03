import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Container } from 'react-bootstrap';
import FeedFollowNav from './FeedFollowNav'
import FollowCard from '../follow/FollowCard'
import "../follow/follow-custom.css"
import { apiGetFeedFollowing, apiGetUrl } from '../../api'
import FollowPlaceholder from '../follow/FollowPlaceholder';
import FollowError from '../follow/FollowError';
import MoreFollow from '../follow/MoreFollow';


function FeedFollowing() {
    // hooks
    const { feedId } = useParams();

  const [followingList, setFollowingList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [followingError, setFollowingError] = useState(false)
  const [followingNextPage, setFollowingNextPage] = useState(null)
  const [moreFollowingLoading, setMoreFollowingLoading] = useState(false)
  const [moreFollowingError, setMoreFollowingError] = useState(false)
  
  const fetchFollowing = async () => {
      setIsLoading(true)

      const resp = await apiGetFeedFollowing(feedId)

      // handle success
      if(resp.ok) {
        const json = await resp.json()
        setFollowingList(json.results)
        setFollowingNextPage(json["next"])
        setIsLoading(false)
      }

      // handle error
      else {
        setIsLoading(false)
        setFollowingError(true)
        console.log('couldnt fetch followingList')
      }
  } 

  const fetchMoreFollowing = async () => {
    setMoreFollowingLoading(true)
    const resp = await apiGetUrl(followingNextPage)

    if(resp.ok) {
      var data = await resp.json()
      setFollowingList(followingList.concat(data["results"]))
      setMoreFollowingError(false)
      setMoreFollowingLoading(false)
      setFollowingNextPage(data["next"])
    }
    else {
      setMoreFollowingError(true)
      setMoreFollowingLoading(false)
      console.error(resp)
    }
  }

  useEffect(() => {
    fetchFollowing()

    return () => {
        setFollowingList([])
        setIsLoading(false)
        setFollowingError(false)
        setFollowingNextPage(null)
        setMoreFollowingLoading(false)
        setMoreFollowingError(false)
    }
  }, [])
  

  return (
    <Container className="border p-0">
         <FeedFollowNav feedId={feedId}/>
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

               {/* More Following (pagination) */}
               {followingNextPage === null
                    ? <></>
                    : moreFollowingLoading === true
                        ? <FollowPlaceholder />
                        : moreFollowingError === true
                            ? <FollowError retryAction={fetchFollowing} />
                            : <MoreFollow action={fetchMoreFollowing}/>
                }
    </Container>
  )
}


export default FeedFollowing
