import React, { useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ProfileContext } from "../../contexts/ProfileContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import ClickableEnsAndAddress from "../ClickableEnsAndAddress";
import PfpResolver from "../PfpResolver";

function FollowNav(props) {
  // const
  const navigate = useNavigate();
  const { profileData } = useContext(ProfileContext);

  const navigateProfile = () => {
    navigate(`/${props.address}/profile`);
  };

  return (
    <>
      <div className="d-flex py-3 px-sm-5 justify-content-center align-items-center">
        <div className="px-2">
          <FontAwesomeIcon
            icon={faArrowLeft}
            onClick={navigateProfile}
            className="fa-lg arrow pointer"
          />
        </div>
        <div className="px-1">
          <PfpResolver
            address={props.address}
            imgUrl={profileData["image"]}
            height="90px"
            width="90px"
            fontSize="0.9rem"
            onClick={navigateProfile}
            className="pointer d-flex justify-content-center mt-2"
          />
          <span>
            <ClickableEnsAndAddress
              address={props.address}
              onClick={navigateProfile}
              className="pointer fs-4 primary-color-hover"
            />
          </span>
        </div>
      </div>
    </>
  );
}

export default FollowNav;
