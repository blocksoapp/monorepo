import React, { useContext, } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { UserContext } from '../../contexts/UserContext.js';
import FeedThumbnail from '../feed/FeedThumbnail.js';


function FeaturedFeeds({feeds}) {
    // hooks
    const { user, setUser, isAuthenticated } = useContext(UserContext)
    const navigate = useNavigate();
    

    // render
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
            <Row className="justify-content-center">
                <Col className="col-auto">
                    <Button
                        className="my-4"
                        variant="outline-primary"
                        size="lg"
                        onClick={() => navigate('/feeds')}
                    >
                        View All
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}


export default FeaturedFeeds;
