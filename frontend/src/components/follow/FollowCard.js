import React, { useState, useEffect, useContext } from "react";
import { Button, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ProfileContext } from "../../contexts/ProfileContext";
import PfpResolver from "../PfpResolver";
import ClickableEnsAndAddress from "../ClickableEnsAndAddress";
import { apiPostFollow, apiPostUnfollow } from "../../api";
import "./follow-custom.css";

function FollowCard(props) {
  // State
  const [buttonMsg, setButtonMsg] = useState("Following");
  const [readMore, setReadMore] = useState(false);

  // Const
  const { profileData, setProfileData } = useContext(ProfileContext);
  const navigate = useNavigate();

  const handleFollow = async () => {
    const resp = await apiPostFollow(props.address);
    if (resp.ok) {
      setButtonMsg("Following");
      setProfileData({
        ...profileData,
        numFollowers: profileData["numFollowers"] + 1,
        followedByMe: true,
      });
    }
  };

  const handleUnfollow = async () => {
    const resp = await apiPostUnfollow(props.address);
    if (resp.ok) {
      setButtonMsg("Follow");
      setProfileData({
        ...profileData,
        numFollowers: profileData["numFollowers"] - 1,
        followedByMe: false,
      });
    } else if (!resp.ok) {
      console.error(resp.error);
    }
  };

  const navigateProfile = () => {
    navigate(`/${props.address}/profile`);
  };

  // Hover On and Off Button Text Change
  const handleHoverOn = () => {
    if (buttonMsg === "Follow") return;
    setButtonMsg("Unfollow");
  };
  const handleHoverOff = () => {
    if (buttonMsg === "Follow") return;
    setButtonMsg("Following");
  };

  // Button Logic
  const handleButtonDisplayed = () => {
    if (props.followedByMe === true) {
      return (
        <Button
          className="outline-primary"
          onClick={handleUnfollow}
          onMouseEnter={handleHoverOn}
          onMouseLeave={handleHoverOff}
        >
          {buttonMsg}
        </Button>
      );
    } else {
      return (
        <Button onClick={handleFollow} className="btn-primary">
          Follow
        </Button>
      );
    }
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
        height="90px"
        width="90px"
        fontSize="0.9rem"
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
          <div className="align-self-center follow-btn">
            {handleButtonDisplayed()}
          </div>
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
