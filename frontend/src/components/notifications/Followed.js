import { useEffect, useState } from "react";
import { NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import EnsAndAddress from "../EnsAndAddress.js";


function Followed({data}) {

    // constants
    const href = `/${data.followedBy}/profile/`;

    return (
        <NavDropdown.Item as={Link} to={href}>
            <EnsAndAddress address={data.followedBy} />
            &nbsp;started following you!
        </NavDropdown.Item>
    )
}


export default Followed;
