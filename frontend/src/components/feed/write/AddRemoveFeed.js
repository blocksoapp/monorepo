// A functional react component that accepts a feed and profile, and displays the feed's image, name, owner, and whether the profile is on the feed.
// If the profile is on the feed, the component displays a checkmark. If the profile is not on the feed, the component displays nothing.
// Clicking the Add button adds the profile to the feed. 
// Clicking the Remove button removes the profile from the feed.
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import {
    apiGetFeedFollowingProfile,
    apiPostFeedFollowing,
    apiDeleteFeedFollowing
} from '../../../api';
import FeedPfp from '../read/FeedPfp';
import TxAddress from '../../TxAddress';


function AddRemoveFeed({feed, profile}) {
    // hooks
    const navigate = useNavigate();

    // state
    const [feedFollowingProfile, setFeedFollowingProfile] = useState(false);

    // functions
    const fetchFeedFollowingProfile = async () => {
        // fetch feed following profile
        const resp = await apiGetFeedFollowingProfile(feed.id, profile.address);

        // handle success
        if (resp.ok) {
            setFeedFollowingProfile(true);
        }

        // handle error
        else {
            console.error(resp);
        }
    }

    const addProfileToFeed = async () => {
        // add profile to feed
        const resp = await apiPostFeedFollowing(feed.id, profile.address);

        // handle success
        if (resp.ok) {
            setFeedFollowingProfile(true);
        }

        // handle error
        else {
            console.error(resp);
        }
    }

    const removeProfileFromFeed = async () => {
        // remove profile from feed
        const resp = await apiDeleteFeedFollowing(feed.id, profile.address);

        // handle success
        if (resp.ok) {
            setFeedFollowingProfile(false);
        }

        // handle error
        else {
            console.error(resp);
        }
    }

    /*
     * Adds or removes a profile from a feed.
     */
    const handleClick = () => {
        if (feedFollowingProfile) {
            // remove profile from feed
            removeProfileFromFeed();
        } else {
            // add profile to feed
            addProfileToFeed();
        }
    }

    // effects
    useEffect(() => {
        fetchFeedFollowingProfile();

        return () => {
            setFeedFollowingProfile(false);
        }
    }, [])


    // render
    return (
        <Container>
            <Row className="align-items-center pointer card-body"
                onClick={handleClick}
            >
                {/* Feed Pfp */}
                <Col xs="auto">
                    <FeedPfp
                        imgUrl={feed.image}
                        height={75}
                        width={75}
                    />
                </Col>

                {/* Feed Details */}
                <Col xs="auto p-3" sm="auto px-3">
                    <Row>
                        {/* Feed Name */}
                        <Col xs="auto">
                            <p
                                className="fs-4 mb-0 link-style"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/feeds/${feed.id}`);
                                }}
                            >{feed.name}</p>
                        </Col>
                    </Row>

                    {/* Feed Owner */}
                    <p className="text-muted">
                        <small>
                            Created by {<TxAddress address={feed.owner.address} />}
                        </small>
                    </p>
                </Col>

                {/* Add or remove button */}
                <Col xs="auto">
                    {feedFollowingProfile &&
                        <FontAwesomeIcon
                            icon={faCheck}
                        />}
                </Col>
            </Row>
        </Container>
    )
}

export default AddRemoveFeed;
