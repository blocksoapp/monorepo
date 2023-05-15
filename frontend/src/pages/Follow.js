import React from "react";
import { Container } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import LeftTabs from "../components/follow/LeftTabs";
import Followers from "../components/follow/Followers";
import Following from "../components/follow/Following";
import "../components/follow/follow-custom.css";
import FollowNav from "../components/follow/FollowNav";

function Follow() {
  const location = useLocation();
  const activeLeftTab = location.state?.activeLeftTab;
  const address = location.pathname.slice(1, 43);

  console.log(address);
  return (
    <Container className="border follow-page">
      <FollowNav address={address} />
      <LeftTabs
        firstTab={<Followers />}
        secondTab={<Following />}
        activeTab={activeLeftTab ? activeLeftTab : "first"}
      />
    </Container>
  );
}

export default Follow;
