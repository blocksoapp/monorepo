import { useEnsName } from 'wagmi'

function EnsAndAddress(props) {
    // constants
    const { data, isError, isLoading } = useEnsName({
        address: props.address,
    })
    const abbrAddress = props.address.substr(2,5) + "..." + props.address.substr(37,5);

    // returns
    if (isLoading) return <span>Fetching ENS name…</span>
    if (isError) return <span>Error fetching ENS name</span>

    // ens name found
    if (data !== null) return (
        <span>{data}
            <span className="fs-6">
                &nbsp;({abbrAddress})
            </span>
        </span>
    )

    // no ens name
    else return (
        <span>{abbrAddress}</span>
    )
}

export default EnsAndAddress;
