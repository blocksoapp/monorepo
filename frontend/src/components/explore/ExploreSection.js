import React, { useState, useEffect, useContext } from "react";
import { apiGetExplore } from "../../api";
import FeaturedProfiles from "./FeaturedProfiles";
import FeaturedFeeds from "./FeaturedFeeds";
import FeaturedFeed from "./FeaturedFeed";
import { SuggestedUserContext } from "../../contexts/SuggestedUserContext";

function ExploreSection() {
  // constants
  const { suggestedFeedData } = useContext(SuggestedUserContext);
  // state
  const [featuredFeedItems, setFeaturedFeedItems] = useState([]);
  const [featuredProfileItems, setFeaturedProfileItems] = useState([]);

  // effects
  useEffect(() => {
    // Set the data from props to state
    if (!suggestedFeedData) return;
    setFeaturedFeedItems(suggestedFeedData.feeds);
    setFeaturedProfileItems(suggestedFeedData.profiles);
  }, [suggestedFeedData]);

  return (
    <div>
      {/* show activity for a random feed */}
      <FeaturedFeed feed={featuredFeedItems} />

      <h3 className="display-6 my-5 text-center text-muted">Discover Feeds</h3>
      <FeaturedFeeds feeds={featuredFeedItems} />
    </div>
  );
}

export default ExploreSection;
