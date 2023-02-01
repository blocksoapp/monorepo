import { useEffect, useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { apiGetFeed } from '../../api';
import FeedDetails from './FeedDetails';
import FeedFollowing from './FeedFollowing';
import EditFeedDetails from './EditFeedDetails';
import EditFeedFollowing from './EditFeedFollowing';
import { UserContext } from '../../contexts/UserContext';


function EditFeed() {

    // hooks
    const { user } = useContext(UserContext);
    const { feedId } = useParams();

    // state
    const [feed, setFeed] = useState(null);


    // functions
    const fetchFeed = async () => {
        const resp = await apiGetFeed(feedId);

        // handle success
        if (resp.ok) {
            const feed = await resp.json();
            setFeed(feed);
        }

        // handle failure
        else {
            //TODO
            console.error(resp);
        }
    }

    // effects
    // load the feed details on component mount
    useEffect(() => {
        fetchFeed();
    }, [feedId]);


    // render
    return (
        <Container>
            {/* Show EditFeedDetails if the user is the owner of the feed */}
            {feed && feed.owner.address === user.profile.address
                ? <EditFeedDetails feed={feed} />
                : <FeedDetails feed={feed} />
            }

            {/* Show EditFeedFollowing if the user is the owner of the feed or the feed is editable by public */}
            {feed && 
                (feed.owner.address === user.profile.address || feed.followingEditableByPublic)
                ? <EditFeedFollowing feed={feed} />
                : <FeedFollowing feed={feed} />
            }
        </Container>
    )
}


export default EditFeed;
