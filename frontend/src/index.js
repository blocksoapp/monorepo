import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import '@rainbow-me/rainbowkit/styles.css';
import "react-image-lightbox/style.css";
import App from "./App";
import Middleware from "./middleware/Middleware";
import { Buffer } from "buffer";


// workaround for
// https://github.com/WalletConnect/walletconnect-monorepo/issues/748
window.Buffer = window.Buffer || Buffer;


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <>
        <Middleware>
            <App />
        </Middleware>
    </>
);
