import React, { useContext, } from 'react'
import { Container, Row } from 'react-bootstrap'
import { UserContext } from '../../contexts/UserContext.js';
import FeedThumbnail from '../feed/FeedThumbnail.js';


function FeaturedFeeds({feeds}) {
    const { user, setUser, isAuthenticated } = useContext(UserContext)
    
    // functions

    return (
        <Container>
            {feeds.map(feed => (
                <FeedThumbnail
                    key={feed.id}
                    data={feed}
                />
            ))}
        </Container>
    );
}


export default FeaturedFeeds;
