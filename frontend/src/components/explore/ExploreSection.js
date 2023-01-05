import React, { useState, useEffect } from 'react'
import { apiGetExplore } from '../../api'
import FeaturedProfiles from './FeaturedProfiles';
import FeaturedFeeds from './FeaturedFeeds';


function ExploreSection() {
    // constants

    // state
    const [featuredFeedItems, setFeaturedFeedItems] = useState([]);
    const [featuredProfileItems, setFeaturedProfileItems] = useState([]);

    // effects

    /*
     * Called on component mount.
     * Gets all the API data for the explore page.
     */
    useEffect(() => {
        const fetchExploreItems = async () => {
            const resp = await apiGetExplore();
            const data = await resp.json();
            setFeaturedFeedItems(data["feeds"]);
            setFeaturedProfileItems(data["profiles"]);
        }
        fetchExploreItems();
    }, [])
    

  return (
    <div>
        <h3 className="display-6 my-5 text-center text-muted">Latest activity from...</h3>
        <FeaturedFeeds feeds={featuredFeedItems} />

        <h3 className="display-4 my-5 text-center text-muted">Featured Profiles</h3>
        <FeaturedProfiles profiles={featuredProfileItems} />
  </div>
  )
}

export default ExploreSection;
