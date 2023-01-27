import React, { useState, useEffect } from 'react'
import { Container } from "react-bootstrap";
import { apiGetFeeds } from '../../api'
import FeedThumbnail from "./FeedThumbnail";


function NewestFeeds() {
    // constants

    // state
    const [feeds, setFeeds] = useState([]);
    //TODO set loading and error states

    // functions

    /*
     * Gets all the API data for the feeds the user follows.
     */
    const fetchFeeds = async () => {
        const resp = await apiGetFeeds();
        //TODO set loading and error states
        if (resp.ok) {
            const data = await resp.json();
            setFeeds(data["results"]);
        }
        else {
            console.error(resp);
        }
    }

    // effects

    /*
     * Called on component mount.
     * Gets all the API data for the feeds the user follows.
     */
    useEffect(() => {
        fetchFeeds();
    }, [])
    

  return (
    <Container>
        {feeds.map(feed => (
            <FeedThumbnail
                key={feed.id}
                data={feed}
            />
        ))}
    </Container>
  )
}

export default NewestFeeds;
