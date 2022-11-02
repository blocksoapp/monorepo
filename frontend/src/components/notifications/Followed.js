import { useEffect, useState } from "react";
import { NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";


function Followed({data}) {

    // constants
    const href = `/${data.followedBy}/profile/`;

    return (
        <NavDropdown.Item as={Link} to={href}>
            {data.followedBy} started following you!
        </NavDropdown.Item>
    )
}


export default Followed;
