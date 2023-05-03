import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { apiPostFollow, apiPostUnfollow } from "../../api";

function FollowButton(props) {
  const [buttonMsg, setButtonMsg] = useState(
    props.followedByMe ? "Following" : "Follow"
  );
  const [loading, setLoading] = useState(false);
  const [buttonClass, setButtonClass] = useState(
    props.followedByMe ? "outline-primary" : "btn-primary"
  );

  const handleFollow = async () => {
    setLoading(true);

    const resp = await apiPostFollow(props.address);
    if (resp.ok) {
      setButtonMsg("Following");
      setButtonClass("outline-primary");
    }

    setLoading(false);
  };

  const handleUnfollow = async () => {
    setLoading(true);

    const resp = await apiPostUnfollow(props.address);
    if (resp.ok) {
      setButtonMsg("Follow");
      setButtonClass("btn-primary");
    } else if (!resp.ok) {
      console.error(resp.error);
    }

    setLoading(false);
  };

  const handleHoverOn = () => {
    if (buttonMsg === "Follow") return;
    setButtonMsg("Unfollow");
    setButtonClass("outline-white");
  };
  const handleHoverOff = () => {
    if (buttonMsg === "Follow") return;
    setButtonMsg("Following");
    setButtonClass(props.followedByMe ? "outline-primary" : "btn-primary");
  };

  const handleClick = () => {
    if (props.followedByMe) {
      handleUnfollow();
    } else {
      handleFollow();
    }
  };

  useEffect(() => {
    setButtonClass(
      loading
        ? "btn-secondary"
        : props.followedByMe
        ? "outline-primary"
        : "btn-primary"
    );
  }, [loading, props.followedByMe]);

  return (
    <Button
      className={`${buttonClass} btn-sm`}
      onClick={handleClick}
      onMouseEnter={handleHoverOn}
      onMouseLeave={handleHoverOff}
      disabled={loading}
    >
      {buttonMsg}
    </Button>
  );
}

export default FollowButton;
