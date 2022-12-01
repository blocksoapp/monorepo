import { Link } from "react-router-dom";
import EnsAndAddress from "../EnsAndAddress";


function AuthorAddress(props) {
    // constants

    // state

    // functions

    // effects

    // render
    return (
        <span>
            <Link
                to={`/${props.address}/profile`}
                style={{ fontStyle: 'italic', textDecoration: 'none', color: 'black' }}
            >
                <EnsAndAddress address={props.address} />
            </Link>
        </span>
    )
}


export default AuthorAddress;
