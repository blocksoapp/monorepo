import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Badge, Button } from "react-bootstrap";
import { apiPostUnfollowFeed, apiPostFollowFeed } from "../../api";


function FeedFollowersFollowingBadges({ feed }) {
    // hooks
    const navigate = useNavigate();

    // state
    const [feedData, setFeedData] = useState(feed);

    // functions
    const handleUnfollow = async (e) => {
        // stop propagation to prevent parent from handling click
        e.stopPropagation();

        // send request
        const resp = await apiPostUnfollowFeed(feed.id);

        // handle success
        if (resp.ok) {
            setFeedData({
                ...feedData,
                numFollowers: feedData["numFollowers"] - 1,
                followedByMe: false
            });
        }
        
        // handle error
        else {
            // TODO handle unauhtenticated user
            console.error(resp);
        }
    }

    const handleFollow = async (e) => {
        // stop propagation to prevent parent from handling click
        e.stopPropagation();

        // send request
        const resp = await apiPostFollowFeed(feed.id);

        // handle success
        if (resp.ok) {
            setFeedData({
                ...feedData,
                numFollowers: feedData["numFollowers"] + 1,
                followedByMe: true
            });
        }

        // handle error
        else {
            // TODO handle unauhtenticated user
            console.error(resp);
        }
    }

    const handleFollowerClick = (e) => {
        // stop propagation to prevent parent from handling click
        e.stopPropagation();

        // navigate to feed followers page
        navigate(`/feeds/${feed.id}/follow`, { state: { activeLeftTab: 'first' } });
    }

    const handleFollowingClick = (e) => {
        // stop propagation to prevent parent from handling click
        e.stopPropagation();

        // navigate to feed following page
        navigate(`/feeds/${feed.id}/follow`, { state: { activeLeftTab: 'second' } });
    }


    return (
        <>
            <Row>
                {/* Following */}
                <Col xs="auto">
                    <h5>
                        <Badge bg="secondary"
                            onClick={handleFollowingClick}
                            style={{ cursor: "pointer"}}
                        >
                            {feedData.numFollowing} Following
                        </Badge>
                    </h5>
                </Col>

                {/* Followers */}
                <Col xs="auto">
                    <h5>
                        <Badge bg="secondary"
                            onClick={handleFollowerClick}
                            style={{ cursor: "pointer"}}
                        >
                            {feedData.numFollowers}
                            {feedData.numFollowers === 1
                                ? " Follower"
                                : " Followers"}
                        </Badge>
                    </h5>
                </Col>

                {/* Follow / Unfollow Button */}
                <Col className="col-auto">
                    {feedData.followedByMe === true
                        ?   <Button
                                variant="primary"
                                size="sm"
                                onClick={handleUnfollow}
                            >
                                Unfollow
                            </Button> 
                        :   <Button
                                variant="primary"
                                size="sm"
                                onClick={handleFollow}
                            >
                                Follow
                            </Button>
                    }
                </Col>
            </Row>
        </>
    );
}


export default FeedFollowersFollowingBadges;
