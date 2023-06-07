import { useEnsName } from "wagmi";
import { abbrAddress } from "../utils.js";


function EnsAndAddress(props) {
    // constants
    const ensNameHook = useEnsName(
        props.address === undefined ? {} : {address: props.address}
    )

    console.log("props:", props, " data:", ensNameHook.data, " isError:", ensNameHook.isError, " isLoading:", ensNameHook.isLoading, " ensNameHook:", ensNameHook);
    // returns
    if (!props.address) return <span>Searching address</span>
    if (ensNameHook.isLoading) return <span>Fetching ENS name…</span>
    if (ensNameHook.isError) return <span>Error fetching ENS name</span>

    // ens name found
    if (ensNameHook.data !== null) return (
        <span>
            {ensNameHook.data}
        </span>
    )

    // no ens name
    else return (
        <span>{abbrAddress(props.address)}</span>
    )
}

export default EnsAndAddress;
