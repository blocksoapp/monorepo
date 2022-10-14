import { useRef, useState } from "react";
import { Overlay, Tooltip } from "react-bootstrap";
import { useEnsName } from "wagmi";
import { abbrAddress } from "../../../utils";


function ProfileEnsAndAddress(props) {
    // constants
    const addressSpanRef = useRef(null);
    const ensNameSpanRef = useRef(null);
    const ensName = useEnsName({address: props.address});

    // state
    const [showAddressCopiedTooltip, setShowAddressCopiedTooltip] = useState(false);
    const [showEnsCopiedTooltip, setShowEnsCopiedTooltip] = useState(false);

    // functions
    const copyEnsName = () => {
        // do copy
        navigator.clipboard.writeText(ensName.data);

        // show success tooltip then hide it
        setShowEnsCopiedTooltip(true);
        setTimeout(
            () => { setShowEnsCopiedTooltip(false) },
            1000
        );
    }

    const copyAddress = () => {
        // do copy
        navigator.clipboard.writeText(props.address);

        // show success tooltip then hide it
        setShowAddressCopiedTooltip(true);
        setTimeout(
            () => { setShowAddressCopiedTooltip(false) },
            1000
        );
    }

    // returns
    if (! props.address) return <span>Missing address</span>
    if (ensName.isLoading) return <span>Fetching ENS name</span>
    if (ensName === null) return <span>Error fetching ENS name</span>

    // ens name found
    if (ensName.data !== null) return (
        <span>
            {/* ENS Name */}
            <span
                style={{ cursor: "pointer" }}
                onClick={copyEnsName}
                ref={ensNameSpanRef}
            >
                {ensName.data}
            </span>
            &nbsp;

            {/* Address abbreviated */}
            <span
                className="fs-6"
                style={{ cursor: "pointer" }}
                onClick={copyAddress}
                ref={addressSpanRef}
            >
                ({abbrAddress(props.address)})
            </span>

            {/* Feedback for copying the ens name */}
            <Overlay
                target={ensNameSpanRef.current}
                show={showEnsCopiedTooltip}
                placement="bottom"
            >
                {(props) => (
                    <Tooltip {...props}>
                        Copied!
                    </Tooltip>
                )}
            </Overlay>

            {/* Feedback for copying the address */}
            <Overlay
                target={addressSpanRef.current}
                show={showAddressCopiedTooltip}
                placement="bottom"
            >
                {(props) => (
                    <Tooltip {...props}>
                        Copied!
                    </Tooltip>
                )}
            </Overlay>
        </span>
    )

    // no ens name
    else return (
        <span>

            {/* Address abbreviated */}
            <span
                style={{ cursor: "pointer" }}
                onClick={copyAddress}
                ref={addressSpanRef}
            >
                {abbrAddress(props.address)}
            </span>

            {/* Feedback for copying the address */}
            <Overlay
                target={addressSpanRef.current}
                show={showAddressCopiedTooltip}
                placement="bottom"
            >
                {(props) => (
                    <Tooltip {...props}>
                        Copied!
                    </Tooltip>
                )}
            </Overlay>

        </span>
    )
}

export default ProfileEnsAndAddress;
