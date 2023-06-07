import {
  WagmiConfig,
  configureChains,
  createConfig,
} from "wagmi";
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { infuraProvider } from "wagmi/providers/infura";
import { getDefaultWallets } from "@rainbow-me/rainbowkit";


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
        projectId: 'bbbd3dae6f2812fbe09bf3ace159e43f',
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
