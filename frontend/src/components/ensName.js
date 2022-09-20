import { useEnsName } from 'wagmi'

function EnsAndAddress(props) {
    // constants
    const { data, isError, isLoading } = useEnsName({
        address: props.address,
    })
    const abbrAddress = props.address.substr(2,5) + "..." + props.address.substr(37,5);

    // returns
    if (isLoading) return <h5>Fetching ENS name…</h5>
    if (isError) return <h5>Error fetching ENS name</h5>

    // ens name found
    if (data !== null) return (
        <h5>{data}
            <span className="fs-6">
                &nbsp;({abbrAddress})
            </span>
        </h5>
    )

    // no ens name
    else return (
        <h5>{abbrAddress}</h5>
    )
}

export default EnsAndAddress;
