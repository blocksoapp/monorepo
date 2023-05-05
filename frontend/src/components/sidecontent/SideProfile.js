import React from "react";
import { Container, Badge, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import PfpResolver from "../PfpResolver";
import ClickableEnsAndAddress from "../ClickableEnsAndAddress";
import "./sidecontent.css";
import FollowButton from "../follow/FollowButton";

function SideProfile(props) {
  // const
  const navigate = useNavigate();
  // functions
  const handleNavigateProfile = () => {
    navigate(`/${props.address}/profile`);
  };
  return (
    <Container
      className="side-feed follow-card pointer"
      onClick={handleNavigateProfile}
    >
      <PfpResolver
        imgUrl={props.image}
        height="48px"
        width="48px"
        onClick={handleNavigateProfile}
        fontSize=".6rem"
        className={"pointer d-flex justify-content-center"}
      />
      <div className="flex-grow-1 d-flex justify-content-between align-items-center">
        <div className="side-feed-content">
          <ClickableEnsAndAddress
            address={props.address}
            className="fs-6 primary-color-hover pointer header-padding"
            onClick={handleNavigateProfile}
          />
          <Badge className="text-dark bg-light align-self-sm-start align-self-center">
            {props.numFollowers}{" "}
            {props.numFollowers === 1 ? "follower" : "followers"}{" "}
          </Badge>
        </div>
        <div>
          <FollowButton
            address={props.address}
            followedByMe={props.followedByMe}
          />
        </div>
      </div>
    </Container>
  );
}

export default SideProfile;
