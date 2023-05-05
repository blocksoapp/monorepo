import React from "react";
import { Container, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import FeedPfp from "../feed/read/FeedPfp";

function SideFeed(props) {
  // const
  const navigate = useNavigate();

  // functions
  const handleClick = () => {
    navigate(`/feeds/${props.id}`);
  };

  return (
    <Container className="side-feed follow-card pointer" onClick={handleClick}>
      <FeedPfp
        imgUrl={props.image}
        height="48px"
        width="48px"
        onClick={handleClick}
        fontSize=".6rem"
        className={"pointer d-flex justify-content-center"}
      />
      <div className="side-feed-content flex-grow-1">
        <p className="">{props.name}</p>
        <Badge className="text-dark bg-light align-self-sm-start align-self-center">
          {props.numFollowers}{" "}
          {props.numFollowers === 1 ? "follower" : "followers"}{" "}
        </Badge>
      </div>
    </Container>
  );
}

export default SideFeed;
