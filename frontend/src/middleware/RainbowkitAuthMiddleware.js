import {
  createAuthenticationAdapter,
  RainbowKitAuthenticationProvider,
} from '@nullbitx8/rainbowkit';
import { SiweMessage } from 'siwe';
import { useAuth } from "../hooks/useAuth";
import { baseAPI } from "../utils";


function RainbowkitAuthMiddleware({children}) {

    // constants
    const { user, login, logout } = useAuth();

    const SIWEConfig = {
      getNonce: async () => {
        const res = await fetch(`${baseAPI}/auth/nonce/`);
        const data = await res.json();
        const nonce = data.nonce;
        return nonce;
      },
      createMessage: ({ nonce, address, chainId }) => {
        return new SiweMessage({
          version: "1",
          domain: window.location.host,
          uri: `${baseAPI}/auth/login/`,
          address,
          chainId,
          nonce,
          statement: "Sign in With Ethereum.",
        })
      },
      getMessageBody: ({ message }) => {
        return message.prepareMessage();
      },
      verify: async ({ message, signature }) => {
        const result = await login(message, signature);
        return result;
      },
      signOut: async () => {
        return (await logout());
      }
    }

    const AuthenticationAdapter = createAuthenticationAdapter(SIWEConfig);

    return (
        <RainbowKitAuthenticationProvider                             
            adapter={AuthenticationAdapter}                           
            status={user !== null ? "authenticated" : "unauthenticated"}
        >
            {children}
        </RainbowKitAuthenticationProvider>
    )
}

export { RainbowkitAuthMiddleware };
