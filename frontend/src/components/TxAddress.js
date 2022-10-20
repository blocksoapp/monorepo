import { Link } from "react-router-dom";
import EnsAndAddress from "./EnsAndAddress";


function TxAddress(props) {
    // constants

    // state

    // functions

    // effects

    // render
    return (
        <span>
            {/* No link if the profileAddress is the subject of the tx */}
            {props.profileAddress && props.address &&
             props.profileAddress.toLowerCase() === props.address.toLowerCase()
                ? <EnsAndAddress address={props.address} />
                :   <Link
                        to={`/${props.address}/profile`}
                        style={{ fontStyle: 'italic', textDecoration: 'none', color: 'black' }}
                    >
                        <EnsAndAddress address={props.address} />
                    </Link>
            }
        </span>
    )
}


export default TxAddress;
