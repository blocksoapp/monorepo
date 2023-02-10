import React, { useState, useEffect, useContext } from 'react'
import { Badge, Button, Col, Container, Image, Row } from 'react-bootstrap'
import { apiGetFeed } from '../../../api';
import { UserContext } from '../../../contexts/UserContext';
import ProfilePlaceholder from '../../profile/ViewProfile/ProfilePlaceholder';
import PfpResolver from '../../PfpResolver';
import FeedDetails from './FeedDetails';
import FeedOptions from './FeedOptions';


function FeedProfile({feedId}) {
    // state
    const [profileData, setProfileData] = useState({});
    const [profileDataLoading, setProfileDataLoading] = useState(true);
    const [profileDataError, setProfileDataError] = useState(false);

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
        }
    }, [feedId])


    return (
        <Container>

            {/* show placeholder or profile data */}
            {profileDataLoading
                ? <Container className="justify-content-center"><ProfilePlaceholder /></Container>
                : profileDataError
                    ? <Container>Error Feedback goes here.</Container>
                    :   <Container>
                            <Row className="justify-content-center">
                                <Col xs={12}>
                                    <FeedDetails feed={profileData} />
                                </Col>
                            </Row>
                        </Container>
            }

        </Container>
    )
}

export default FeedProfile;
