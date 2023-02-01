import React, { useState, useEffect, useContext } from 'react'
import { Badge, Button, Col, Container, Image, Row } from 'react-bootstrap'
import {
    apiGetFeed, apiPostFollowFeed, apiPostUnfollowFeed
} from '../../api';
import { UserContext } from '../../contexts/UserContext';
import ProfilePlaceholder from '../profile/ViewProfile/ProfilePlaceholder';
import PfpResolver from '../PfpResolver';
import FeedOptions from './FeedOptions';


function FeedProfile({feedId}) {
    // constants
    const { user } = useContext(UserContext)

    // state
    const [profileData, setProfileData] = useState({});
    const [profileDataLoading, setProfileDataLoading] = useState(true);
    const [profileDataError, setProfileDataError] = useState(false);
    const [activeLeftTab, setActiveLeftTab] = useState('first')

    // functions
    const fetchFeed = async () => {
        setProfileDataLoading(true);
        const resp = await apiGetFeed(feedId);

        if (resp.status === 200) {
            var data = await resp.json();
            setProfileData(data);
            setProfileDataLoading(false);
            setProfileDataError(false);
        }
        else {
            console.error(resp);
            setProfileDataLoading(false);
            setProfileDataError(true);
        }
    }

    const handleUnfollow = async () => {
        const res = await apiPostUnfollowFeed(feedId)
        if (res.ok) {
            setProfileData({
                ...profileData,
                numFollowers: profileData["numFollowers"] - 1,
                followedByMe: false
            });
        }
    }

    const handleFollow = async () => {
        const res = await apiPostFollowFeed(feedId)
        if (res.ok) {
            setProfileData({
                ...profileData,
                numFollowers: profileData["numFollowers"] + 1,
                followedByMe: true
            });
        }
    }
    
    // Navigate to user's followers
    const handleFollowerClick = () => {
        //TODO
        //navigate(`/${props.address}/profile/follow`, { state: { activeLeftTab: 'first' } })
    }

    const handleFollowingClick = () => {
        //TODO
        //navigate(`/${props.address}/profile/follow`, { state: { activeLeftTab: 'second' } })
    }

    // effects

    /* 
     * Fetch feed details when its id is set or changes.
     */
    useEffect(() => {
        // do nothing if id is null or undefined
        if (!feedId) {
            return;
        }

        // load the feed's details
        fetchFeed();

        // clean up on unmount of effect
        return () => {
            // reset the current profile state
            setProfileDataLoading(true);
            setProfileDataError(false);
            setProfileData({});
            setActiveLeftTab('first');
        }
    }, [feedId])


    return (
        <Container>

            {/* show placeholder or profile data */}
            {profileDataLoading
                ? <Container className="justify-content-center"><ProfilePlaceholder /></Container>
                : profileDataError
                    ? <Container>Error Feedback goes here.</Container>
                    : <Container fluid>

                        {/* User Info Section */}
                        <Container className="border-bottom border-light">

                            {/* Profile picture */}
                            <Row className="justify-content-center">
                                <Col className="col-auto">
                                    <Row className="justify-content-center">
                                        <Col className="col-auto">
                                            <PfpResolver
                                                imgUrl={profileData["image"]}
                                                height="256px"
                                                width="256px"
                                                fontSize="1.75rem"
                                                className="justify-content-center"
                                            />
                                        </Col>
                                    </Row>

                                    {/* feed name */}
                                    <Row className="justify-content-center mt-4">
                                        <Col className="col-auto text-center">
                                            <h4>
                                                {profileData["name"]}
                                            </h4>
                                        </Col>
                                    </Row>

                                    {/* feed description */}
                                    <Row className="justify-content-center mt-3">
                                        <Col className="col-auto">
                                            <p>{profileData["description"]}</p>
                                        </Col>
                                    </Row>

                                    {/* Follower/Following counts and Follow button */}
                                    <Row className="justify-content-center mt-3 mb-3">
                                        <Col className="col-auto">
                                            <h5>
                                                    <Badge bg="secondary" className="pointer light-hover " onClick={handleFollowerClick}>
                                                    
                                                        {profileData["numFollowers"]}
                                                        {profileData["numFollowers"] === 1 ?
                                                            " Follower" : " Followers"}
                                                    </Badge> 
                                            </h5>
                                        </Col>
                                        <Col className="col-auto">
                                            <h5>   
                                                    <Badge bg="secondary" className="pointer" onClick={handleFollowingClick}>
                                                        {profileData["numFollowing"]} Following
                                                    </Badge> 
                                            </h5>
                                        </Col>
                                        <Col className="col-auto">
                                            {user !== null && profileData["followedByMe"] === true
                                                ? <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={handleUnfollow}
                                                    disabled={user !== null && user["address"] === profileData["owner"] ? true : false}
                                                >
                                                    Unfollow
                                                </Button> 
                                                : <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={handleFollow}
                                                    disabled={user !== null && user["address"] === profileData["owner"] ? true : false}
                                                >
                                                    Follow
                                                </Button>
                                            }
                                        </Col>
                                    </Row>
                                </Col>
                                <Col className="col-auto">
                                    <FeedOptions feedId={feedId} />
                                </Col>
                            </Row>

                        </Container>
                    </Container>
            }

        </Container>
    )
}

export default FeedProfile;
