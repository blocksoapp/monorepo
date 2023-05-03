import React, { useContext, useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import "./sidecontent.css";
import { SuggestedUserContext } from "../../contexts/SuggestedUserContext";

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
      <h1 className="">Who To Follow</h1>
      <div className="d-flex flex-column">
        {featuredProfiles.map((profile, index) => (
          <div className="d-flex flex-row" key={index}>
            <img
              className="rounded-circle"
              src={profile.profilePicture}
              alt="profile"
              width="50"
              height="50"
            />
            <div className="d-flex flex-column">
              <p className="">{profile.address}</p>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}

export default RecommendedProfiles;
