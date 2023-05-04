import React, { useState } from "react";
import { Badge, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import PfpResolver from "../PfpResolver";
import ClickableEnsAndAddress from "../ClickableEnsAndAddress";
import "./follow-custom.css";
import FollowButton from "./FollowButton";

function FollowCard(props) {
  const navigate = useNavigate();
  const [readMore, setReadMore] = useState(false);

  const navigateProfile = () => {
    navigate(`/${props.address}/profile`);
  };

  // shorten bio
  const abbrBio = (bio) => {
    if (bio.length > 200) {
      if (readMore === false) {
        return (
          <div>
            {bio.substr(0, 200) + "..."}
            <span className="link-style" onClick={() => setReadMore(true)}>
              {" "}
              read more
            </span>
          </div>
        );
      } else if (readMore === true) {
        return <div>{bio}</div>;
      }
    } else return bio;
  };

  return (
    <Container className="d-flex align-items-center py-sm-3 py-1 follow-card">
      <PfpResolver
        address={props.address}
        imgUrl={props.imgUrl}
        height="48px"
        width="48px"
        fontSize=".6rem"
        onClick={navigateProfile}
        className="pointer d-flex justify-content-center mt-2"
      />
      <div className="flex-grow-1 ps-sm-4">
        <div className="follow-body">
          <div className="d-flex flex-column">
            <ClickableEnsAndAddress
              address={props.address}
              className="fs-6 primary-color-hover pointer"
              onClick={navigateProfile}
            />
            <Badge className="text-dark bg-light align-self-sm-start align-self-center">
              {props.numFollowers}{" "}
              {props.numFollowers === 1 ? "follower" : "followers"}{" "}
            </Badge>

            {props.bio && props.showBio && (
              <p className="fs-6 pt-1 px-sm-0 bio">{abbrBio(props.bio)}</p>
            )}
          </div>

          <div>
            {props.showFollowButton && (
              <FollowButton
                address={props.address}
                followedByMe={props.followedByMe}
              />
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}

export default FollowCard;
