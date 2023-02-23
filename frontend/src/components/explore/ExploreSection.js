import React, { useState, useEffect } from 'react'
import { apiGetExplore } from '../../api'
import FeaturedProfiles from './FeaturedProfiles';
import FeaturedFeeds from './FeaturedFeeds';
import FeaturedFeed from './FeaturedFeed';


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
        {/* show activity for a random feed */}
        <h3 className="display-6 my-5 text-center text-muted">Latest activity from...</h3>
        {featuredFeedItems.length > 0 && 
            <FeaturedFeed
                feedId={featuredFeedItems[
                    Math.floor(
                        Math.random()*featuredFeedItems.length
                    )
                ].id
                }
            />
        }

        <h3 className="display-6 my-5 text-center text-muted">Discover Feeds</h3>
        <FeaturedFeeds feeds={featuredFeedItems} />
  </div>
  )
}

export default ExploreSection;
