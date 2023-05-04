import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import EnsAndAddress from "../EnsAndAddress";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import ClickableEnsAndAddress from "../ClickableEnsAndAddress";
import { Container } from "react-bootstrap";

function FollowNav(props) {
  const navigate = useNavigate();

  const navigateProfile = () => {
    navigate(`/${props.address}/profile`);
  };

  return (
    <Container className="follow-header d-flex border-bottom align-items-center">
      <div className="arrow">
        <FontAwesomeIcon
          icon={faArrowLeft}
          onClick={navigateProfile}
          className="p-2 fa-lg pointer"
        />
      </div>
      <div className="px-1">
        <span>
          <ClickableEnsAndAddress
            address={props.address}
            onClick={navigateProfile}
            className="pointer fs-5"
          />
        </span>
      </div>
    </Container>
  );
}

export default FollowNav;
