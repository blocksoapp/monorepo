import { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import FollowCard from '../../follow/FollowCard'
import { apiGetFeedFollowers, apiGetUrl } from '../../../api'
import FollowPlaceholder from '../../follow/FollowPlaceholder'
import FollowError from '../../follow/FollowError'
import FeedFollowNav from './FeedFollowNav'
import MoreFollow from '../../follow/MoreFollow'
import "../../follow/follow-custom.css"


function FeedFollowers() {
    // hooks
    const { feedId } = useParams();

    const [followers, setFollowers] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [active, setActive] = useState(true)
    const [followError, setFollowError] = useState(false)
    const [followersNextPage, setFollowersNextPage] = useState(null)
    const [moreFollowersLoading, setMoreFollowersLoading] = useState(false)
    const [moreFollowersError, setMoreFollowersError] = useState(false)
  
    // functions

    const fetchFeedFollowers = async () => {
        setIsLoading(true);

        // fetch feed followers
        const resp = await apiGetFeedFollowers(feedId);

        // handle success
        if(resp.ok) {
            const json = await resp.json();
            setFollowers(json["results"]);
            setFollowersNextPage(json["next"]);
            setIsLoading(false);
        } 

        // handle error
        else {
            console.log(resp);
            setIsLoading(false);
            setFollowError(true);
        }
    } 

    const fetchMoreFollowers = async () => {
        setMoreFollowersLoading(true)

        // fetch more followers
        const resp = await apiGetUrl(followersNextPage)

        // handle success
        if(resp.ok) {
          var data = await resp.json()
          setFollowers(followers.concat(data["results"]))
          setMoreFollowersError(false)
          setMoreFollowersLoading(false)
          setFollowersNextPage(data["next"])
        }

        // handle error
        else {
          console.error(resp)
          setMoreFollowersError(true)
          setMoreFollowersLoading(false)
        }
    }

    // effects
    useEffect(() => {
        fetchFeedFollowers()

        return () => {
            setFollowers([])
            setIsLoading(false)
            setActive(true)
            setFollowError(false)
            setFollowersNextPage(null)
            setMoreFollowersLoading(false)
            setMoreFollowersError(false)
        }
    }, [])
  
 
  return (
    <Container className="border p-0">
        <FeedFollowNav feedId={feedId} active={active}/>
        {isLoading 
          ? <FollowPlaceholder/>
          : followError 
            ? <FollowError retryAction={fetchFeedFollowers} />
            : <>
              {(followers === undefined || followers.length === 0)
                ? <p className="fs-2 text-center align-item-center p-2">No results.</p>
                : followers.map( (follower, index) => {
                  return (
                    <FollowCard
                      key={index}
                      imgUrl={follower.image}
                      address={follower.address}
                      bio={follower.bio}
                      followedByMe={follower.followedByMe}
                      numFollowers={follower.numFollowers}
                    />
              )}) }
            </> }

            {/* More Following (pagination) */}
            {followersNextPage === null
                    ? <></>
                    : moreFollowersLoading === true
                        ? <FollowPlaceholder />
                        : moreFollowersError === true
                            ? <FollowError retryAction={fetchFeedFollowers} />
                            : <MoreFollow action={fetchMoreFollowers}/>
                }
    </Container>
  )
}


export default FeedFollowers;
