import React from 'react';
import ReactDOM from 'react-dom/client';
import NavbarComponent from './components/ui/Navbar';
import Footer from './components/ui/Footer';
import './index.css';
import App from './App';

import { WagmiConfig, createClient } from 'wagmi'
import { getDefaultProvider } from 'ethers'


/* Establishing a client for wagmi */
const client = createClient({
  autoConnect: true,
  provider: getDefaultProvider(),
})

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <>
    <WagmiConfig client={client}> 
      <NavbarComponent/>
      <App />
    </WagmiConfig>
    <Footer/>
    </>
);
