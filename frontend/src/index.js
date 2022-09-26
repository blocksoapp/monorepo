import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { 
    WagmiConfig,
    configureChains,
    createClient,
    defaultChains
} from 'wagmi'
import { infuraProvider } from 'wagmi/providers/infura'


/* Establishing a client for wagmi */
const { provider } = configureChains(
  defaultChains,
  [infuraProvider({ apiKey: process.env.REACT_APP_INFURA_KEY })],
)

const client = createClient({
  autoConnect: true,
  provider: provider,
})

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <>
      <WagmiConfig client={client}> 
      <App />
      </WagmiConfig>
    </>
);
