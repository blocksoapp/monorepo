import { useEnsName } from 'wagmi'

function EnsAndAddress(props) {
    // constants
    const { data, isError, isLoading } = useEnsName({
        address: props.address,
    })

    // functions
    const getAbbrAddress = function(address) {
        return address.substr(2,5) + "..." + props.address.substr(37,5);
    }

    // returns
    if (! "address" in props) return <span>Missing address</span>
    if (isLoading) return <span>Fetching ENS name…</span>
    if (isError) return <span>Error fetching ENS name</span>

    // ens name found
    if (data !== null) return (
        <span>{data}
            <span className="fs-6">
                &nbsp;({getAbbrAddress(props.address)})
            </span>
        </span>
    )

    // no ens name
    else return (
        <span>{getAbbrAddress(props.address)}</span>
    )
}

export default EnsAndAddress;
