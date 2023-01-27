import React, { useState, useEffect, useContext } from 'react';
import { useParams } from "react-router-dom"; 
import { Container } from "react-bootstrap";
import FeedProfile from "./FeedProfile";
import Feed from "./Feed";


function ViewFeed() {
    // constants
    const { feedId } = useParams();

    // state
 
    // functions

    // effects


    return (
        <Container>
            <FeedProfile feedId={feedId} />
            <Feed id={feedId} />
        </Container>
    )
}

export default ViewFeed;
