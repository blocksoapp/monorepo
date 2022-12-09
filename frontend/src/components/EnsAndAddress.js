import { useEnsName } from "wagmi";
import { abbrAddress } from "../utils.js";


function EnsAndAddress(props) {
    // constants
    const { data, isError, isLoading } = useEnsName({
        address: props.address,
    })

    // returns
    if (!props.address) return <span>Searching address</span>
    if (isLoading) return <span>Fetching ENS name…</span>
    if (isError) return <span>Error fetching ENS name</span>

    // ens name found
    if (data !== null) return (
        <span className=''>
            {data}
            <span className="fs-6">
                &nbsp;({abbrAddress(props.address)})
            </span>
        </span>
    )

    // no ens name
    else return (
        <span>{abbrAddress(props.address)}</span>
    )
}

export default EnsAndAddress;
