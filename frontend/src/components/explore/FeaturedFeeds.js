import React, { useContext, } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { UserContext } from '../../contexts/UserContext.js';
import FeedThumbnail from '../feed/FeedThumbnail.js';


function FeaturedFeeds({feeds}) {
    const { user, setUser, isAuthenticated } = useContext(UserContext)
    
    // functions

    return (
        <Container>
            <Row>
                {feeds.map(feed => (
                    <Col xs={6}>
                        <FeedThumbnail
                            key={feed.id}
                            data={feed}
                        />
                    </Col>
                ))}
            </Row>
        </Container>
    );
}


export default FeaturedFeeds;
