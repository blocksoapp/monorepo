import React, { useContext, useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import "./sidecontent.css";
import { SuggestedUserContext } from "../../contexts/SuggestedUserContext";
import FollowCard from "../follow/FollowCard";

//
function RecommendedProfiles() {
  // constants
  const { suggestedFeedData } = useContext(SuggestedUserContext);
  // state
  const [featuredProfiles, setFeaturedProfiles] = useState([]);

  useEffect(() => {
    // Set the data from props to state
    if (!suggestedFeedData) return;
    setFeaturedProfiles(suggestedFeedData.profiles);
  }, [suggestedFeedData]);

  return (
    <Container className="side-content-card">
      <h1 className="text-center">Suggested Profiles</h1>
      <div className="d-flex flex-column">
        {featuredProfiles.map((profile, index) => (
          <div className="" key={index}>
            <FollowCard
              address={profile.address}
              imageUrl={profile.imageUrl}
              numFollowers={profile.numFollowers}
            />
          </div>
        ))}
      </div>
    </Container>
  );
}

export default RecommendedProfiles;
