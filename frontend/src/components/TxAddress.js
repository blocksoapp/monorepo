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
           <Link to={`/${props.address}/profile`}>
                @<EnsAndAddress address={props.address} />
           </Link>
        </span>
    )
}


export default TxAddress;
