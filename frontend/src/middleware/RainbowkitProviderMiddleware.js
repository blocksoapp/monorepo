import { useNetwork } from "wagmi";
import { RainbowKitProvider } from "@nullbitx8/rainbowkit";


function RainbowkitProviderMiddleware({children}) {

    // constants
    const { chains } = useNetwork();

    return (
        <RainbowKitProvider chains={chains} coolMode>
            {children}
        </RainbowKitProvider>
    )
}

export { RainbowkitProviderMiddleware };
