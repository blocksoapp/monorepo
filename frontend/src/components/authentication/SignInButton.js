import React, { useContext, useState, useEffect } from "react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import "../ui/sidenavbar/sidenavbar.css";

function SignInButton({ buttonText }) {

  return (
    <div className="">
      <ConnectButton
        label="Sign In"
        showBalance={false}
        chainStatus="none"
      />
    </div>
  );
}

export default SignInButton;
