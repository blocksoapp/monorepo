import { useEffect, useState } from "react";
import { NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";


function MentionedInComment({data}) {

    // constants
    const href = `/posts/${data.post}#${data.comment}`;

    return (
        <NavDropdown.Item as={Link} to={href}>
            {data.mentionedBy} mentioned you in a comment!
        </NavDropdown.Item>
    )
}


export default MentionedInComment;
