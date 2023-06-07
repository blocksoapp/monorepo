import { useEnsName } from "wagmi";
import { abbrAddress } from "../utils.js";


function EnsAndAddress(props) {
    // constants
    const { data } = useEnsName({address: props.address});

    // returns
    if (!props.address) return <span>Searching address</span>

    // ens name found
    if (data) return (
        <span>
            {data}
        </span>
    )

    // no ens name
    else return (
        <span>{abbrAddress(props.address)}</span>
    )
}

export default EnsAndAddress;
