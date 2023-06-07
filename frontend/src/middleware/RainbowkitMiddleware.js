import { RainbowkitAuthMiddleware } from "./RainbowkitAuthMiddleware";
import { RainbowkitProviderMiddleware } from "./RainbowkitProviderMiddleware";


function RainbowkitMiddleware({children}) {

    return (
        <>
            <RainbowkitAuthMiddleware>
                <RainbowkitProviderMiddleware>
                    {children}
                </RainbowkitProviderMiddleware>
            </RainbowkitAuthMiddleware>
        </>
    )
}

export { RainbowkitMiddleware };
