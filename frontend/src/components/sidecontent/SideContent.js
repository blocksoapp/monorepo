import React, { useContext, useState } from "react";
import { Container } from "react-bootstrap";
import RecommendedProfiles from "./RecommendedProfiles";
import TrendingFeeds from "./TrendingFeeds";
import SearchBar from "../searchbar/SearchBar";
import { SuggestedUserContext } from "../../contexts/SuggestedUserContext";

function SideContent() {
  return (
    <Container className="py-1">
      {/* search bar here fixed to top */}
      <SearchBar />
      {/* feeds to follow */}
      <TrendingFeeds />
      {/* profiles to follow */}
      <RecommendedProfiles />
    </Container>
  );
}

export default SideContent;
