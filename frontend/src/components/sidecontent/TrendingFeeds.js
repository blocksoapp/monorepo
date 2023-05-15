import React, { useContext, useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { SuggestedUserContext } from "../../contexts/SuggestedUserContext";
import SideFeed from "./SideFeed";

function TrendingFeeds() {
  // constants
  const { suggestedFeedData } = useContext(SuggestedUserContext);
  // state
  const [trendingFeeds, setTrendingFeeds] = useState([]);

  useEffect(() => {
    // Set the data from props to state
    if (!suggestedFeedData) return;
    setTrendingFeeds(suggestedFeedData.feeds);
  }, [suggestedFeedData]);
  return (
    <Container className="side-content-card margin-top-1">
      <h1>Discover Feeds</h1>
      <div className="d-flex flex-column">
        {trendingFeeds.map(
          (feed) =>
            !feed.followedByMe && (
              <div key={feed.id}>
                <SideFeed
                  id={feed.id}
                  name={feed.name}
                  image={feed.image}
                  description={feed.description}
                  numFollowers={feed.numFollowers}
                />
              </div>
            )
        )}
      </div>
    </Container>
  );
}

export default TrendingFeeds;
