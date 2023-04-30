import React from "react";
import SignInButton from "../authentication/SignInButton";
import "./mainheader.css";

function MainHeader(props) {
  return (
    <div className="main-content-header">
      <div className="header-div">
        <h1>{props.header}</h1>
        <div className="sign-in-button">
          <SignInButton />
        </div>
      </div>
    </div>
  );
}

export default MainHeader;
