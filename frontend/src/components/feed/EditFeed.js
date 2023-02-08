import { useEffect, useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { apiGetFeed } from '../../api';
import { UserContext } from '../../contexts/UserContext';
import FeedDetails from './FeedDetails';
import FeedFollowing from './FeedFollowing';
import EditFeedDetails from './EditFeedDetails';
import EditFeedFollowing from './EditFeedFollowing';
import DeleteFeedButton from './DeleteFeedButton';


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
        !feed
            ? (<></>)
            : (
                <Container>
                    {/* Show EditFeedDetails if the user is the owner of the feed */}
                    {feed.owner.address === user.profile.address
                        ? <EditFeedDetails feed={feed} />
                        : <FeedDetails feed={feed} inEditFeed={true} />
                    }

                    {/* Show EditFeedFollowing if the user is the owner of the feed or the feed is editable by public */}
                    {feed.owner.address === user.profile.address || feed.followingEditableByPublic
                        ? <EditFeedFollowing feed={feed} />
                        : <p className="mt-5 px-4 py-5 f-2 text-muted">Only the feed owner can choose who this feed follows.</p>
                    }

                    {/* Show Delete section if the user is the owner of the feed */}
                    {feed.owner.address === user.profile.address &&
                        <Container className="mb-3">
                            <h3>Delete Feed</h3>
                            <p>Deleting a feed will remove it from the system. This action cannot be undone.</p>
                            <DeleteFeedButton feedId={feed.id} />
                        </Container>
                    }
                </Container>
            )
    );
}


export default EditFeed;
