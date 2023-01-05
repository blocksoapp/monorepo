import React, { useContext, useState, useEffect } from "react";
import { ConnectKitButton, SIWEButton, useSIWE } from "connectkit";
import { UserContext } from "../../contexts/UserContext";
import { apiGetUser } from "../../api";
import ToastComponent from "./ToastComponent";

function SignInButton({ buttonText }) {
  // Constants
  const { setUser } = useContext(UserContext);
  const { signedIn } = useSIWE();

  // State
  const [toggleToast, setToggleToast] = useState(Boolean);

  useEffect(() => {
    if (!signedIn) return;
    const loadUserContext = async () => {
      const res = await apiGetUser();
      if (res.ok) {
        const json = await res.json();
        setUser(json);
      } else {
        console.log("Failed to load user data.");
      }
    };

    loadUserContext();
  }, [signedIn]);

  return (
    <div className="pb-1">
      <ToastComponent
        isToggle={toggleToast}
        setIsToggle={setToggleToast}
        heading="Session Expired"
        body="Your session has timed out. Please sign in again."
      />
      <ConnectKitButton>
        <SIWEButton />
      </ConnectKitButton>
    </div>
  );
}

export default SignInButton;
