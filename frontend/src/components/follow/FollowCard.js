import React, { useState } from "react";
import { Button, Badge } from "react-bootstrap";
import { json, useNavigate } from "react-router-dom";
import PfpResolver from "../PfpResolver";
import ClickableEnsAndAddress from "../ClickableEnsAndAddress";
import { apiPostFollow, apiPostUnfollow, apiGetProfile } from "../../api";
import "./follow-custom.css";
import FollowButton from "./FollowButton";

function FollowCard(props) {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(props);
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
    <div className="d-flex flex-sm-row flex-column align-items-sm-center py-sm-3 py-1 px-sm-2 px-lg-5 light-hover">
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
              className="fs-5 primary-color-hover pointer"
              onClick={navigateProfile}
            />
            <Badge className="text-dark bg-light align-self-sm-start align-self-center">
              {props.numFollowers}{" "}
              {props.numFollowers === 1 ? "follower" : "followers"}{" "}
            </Badge>
          </div>
          {props.showFollowButton && (
            <FollowButton
              address={props.address}
              followedByMe={props.followedByMe}
            />
          )}
        </div>
        <div className="">
          {props.bio && (
            <p className="fs-6 pt-1 px-sm-0 px-3 bio">{abbrBio(props.bio)}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default FollowCard;
