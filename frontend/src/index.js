import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "react-image-lightbox/style.css";
import App from "./App";
import {
  WagmiConfig,
  configureChains,
  createClient,
  defaultChains,
} from "wagmi";
import { SIWEProvider, ConnectKitProvider } from "connectkit";
import { SiweMessage } from "siwe";
import { infuraProvider } from "wagmi/providers/infura";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { baseAPI, getCookie } from "./utils";

/* Establishing a client for wagmi */
const { chains, provider, webSocketProvider } = configureChains(defaultChains, [
  infuraProvider({ apiKey: process.env.REACT_APP_INFURA_KEY }),
]);

// Set up client
const client = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: "wagmi",
        headlessMode: true,
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        qrcode: true,
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: "All Others",
        shimDisconnect: true,
      },
    }),
  ],
  provider,
  webSocketProvider,
});

// Set up SIWE
// SIWE dependencies
const siweConfig = {
  // Required
  getNonce: async () => {
    const res = await fetch(`${baseAPI}/auth/nonce/`);
    const data = await res.json();
    const nonce = data.nonce;
    return nonce;
  },
  createMessage: ({ nonce, address, chainId }) =>
    new SiweMessage({
      version: "1",
      domain: window.location.host,
      uri: `${baseAPI}/auth/login/`,
      address,
      chainId,
      nonce,
      statement: "Sign in With Ethereum.",
    }).prepareMessage(),
  verifyMessage: async ({ message, signature }) =>
    await fetch(`${baseAPI}/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFTOKEN": getCookie("csrftoken"),
      },
      credentials: "include",
      body: JSON.stringify({ message, signature }),
    }).then((res) => res.ok),
  getSession: async () =>
    await fetch(`${baseAPI}/auth/session/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFTOKEN": getCookie("csrftoken"),
      },
      credentials: "include",
    }).then((res) => (res.ok ? res.json() : null)),
  signOut: async () =>
    await fetch(`${baseAPI}/auth/logout/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFTOKEN": getCookie("csrftoken"),
      },
      credentials: "include",
    }).then((res) => res.ok),
  enabled: true,
  nonceRefetchInterval: 300000, // in seconds, defaults to 5 minutes
  sessionRefetchInterval: 300000, // in seconds, defaults to 5 minutes
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    <WagmiConfig client={client}>
      <SIWEProvider {...siweConfig}>
        <ConnectKitProvider
          theme="soft"
          customTheme={{
            "--ck-connectbutton-color": "#ffffff",
            "--ck-connectbutton-background": "#0d6efd",
            "--ck-connectbutton-hover-background": "#0b5ed7",
            "--ck-connectbutton-font-size": "1rem",
            "--ck-connectbutton-border-radius": ".375rem",
          }}
        >
          <App />
        </ConnectKitProvider>
      </SIWEProvider>
    </WagmiConfig>
  </>
);
