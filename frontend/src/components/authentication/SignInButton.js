import React, { useContext, useState, useEffect } from "react";
import { ConnectKitButton, SIWEButton, useSIWE } from "connectkit";
import { UserContext } from "../../contexts/UserContext";
import { apiGetUser } from "../../api";
import ToastComponent from "./ToastComponent";
import "../ui/sidenavbar/sidenavbar.css";

function SignInButton({ buttonText }) {
  // Constants

  // State
  const [toggleToast, setToggleToast] = useState(Boolean);

  return (
    <div className="">
      <ToastComponent
        isToggle={toggleToast}
        setIsToggle={setToggleToast}
        heading="Session Expired"
        body="Your session has timed out. Please sign in again."
      />
      <ConnectKitButton label="Sign In">
        <SIWEButton />
      </ConnectKitButton>
    </div>
  );
}

export default SignInButton;
