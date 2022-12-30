import React, { useContext, } from 'react'
import { Container, Row } from 'react-bootstrap'
import { UserContext } from '../../contexts/UserContext.js';
import Feed from '../feed/Feed.js';


function FeaturedFeeds({feeds}) {
    const { user, setUser, isAuthenticated } = useContext(UserContext)
    
    // functions

    return (
        <Container>
            {feeds.map(feed => (
                <Feed
                    key={feed.id}
                    id={feed.id}
                    name={feed.name}
                />
            ))}
        </Container>
    );
}

export default FeaturedFeeds;
