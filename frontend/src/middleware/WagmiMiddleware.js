import {
  WagmiConfig,
  configureChains,
  createConfig,
} from "wagmi";
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { infuraProvider } from "wagmi/providers/infura";
import { getDefaultWallets } from "@nullbitx8/rainbowkit";


function WagmiMiddleware({children}) {

    /* Establishing a client for wagmi */
    const { chains, publicClient } = configureChains(
        [mainnet, polygon, optimism, arbitrum],
        [
            infuraProvider({ apiKey: process.env.REACT_APP_INFURA_KEY }),
            publicProvider()
        ]
    );

    // Set up client
    const { connectors } = getDefaultWallets({
        appName: 'Blockso',
        projectId: process.env.REACT_APP_WALLETCONNECT_PROJECTID,
        chains
    });

    const wagmiConfig = createConfig({
        autoConnect: true,
        connectors,
        publicClient
    });


    return (
        <WagmiConfig config={wagmiConfig}>
            {children}
        </WagmiConfig>
    )
}

export { WagmiMiddleware };
