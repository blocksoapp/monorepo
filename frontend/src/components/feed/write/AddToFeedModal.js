import { useEffect, useState } from 'react';
import { Alert, Button, Container, Modal } from 'react-bootstrap';
import { apiGetFeedsOwnedOrEditable, apiGetUrl } from '../../../api';
import { usePageBottom } from '../../../hooks/usePageBottom';
import AddRemoveFeed from './AddRemoveFeed';


function AddToFeedModal({profile, show, setShow}) {
    // hooks
    const reachedPageBottom = usePageBottom();
    
    // state
    const [feeds, setFeeds] = useState([]);
    const [error, setError] = useState("");
    const [feedsNextPage, setFeedsNextPage] = useState(null);

    // functions
    const fetchFeedsOwnedOrEditable = async () => {
        // get feeds
        const resp = await apiGetFeedsOwnedOrEditable();

        // handle success
        if (resp.ok) {
            const feeds = await resp.json();
            setFeeds(feeds["results"]);
            setError("");
        }

        // handle error
        else {
            console.error(resp);
            setFeeds([]);
            setError("Error fetching feeds");
        }
    };
    
    // function to get paginated results from api
    const fetchNextFeeds = async () => {
        // get feeds
        const resp = await apiGetUrl(feedsNextPage);

        // handle success
        if (resp.ok) {
            const data = await resp.json();
            setFeeds(feeds.concat(data["results"]));
            setFeedsNextPage(data["next"]);
            setError("");
        }

        // handle error
        else {
            console.error(resp);
            setError("Error fetching more feeds");
        }
    };


    // effects
    useEffect(() => {
        // get feeds
        fetchFeedsOwnedOrEditable();

        return () => {
            // cleanup
        }
    }, []);

    useEffect(() => {
        // get next page of feeds
        if (reachedPageBottom && feedsNextPage) {
            fetchNextFeeds(feedsNextPage);
        }
    }, [reachedPageBottom]);


    // render
    return (
        <Modal show={show} onHide={() => setShow(false)}>
            {/* Modal Header */}
            <Modal.Header closeButton>
                <Modal.Title>Add profile to feed</Modal.Title>
            </Modal.Header>

            {/* Modal Body */}
            <Modal.Body>
                <p>Click on a feed to add or remove profile from it.</p>

                <Container>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {feeds.map(feed => (
                        <AddRemoveFeed key={feed.id} feed={feed} profile={profile} />
                    ))}
                </Container>
            </Modal.Body>

        </Modal>
    );
};

export default AddToFeedModal;
