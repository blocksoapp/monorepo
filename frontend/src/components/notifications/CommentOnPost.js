import { useEffect, useState } from "react";
import { NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";


function CommentOnPost({data}) {

    // constants
    const href = `/posts/${data.post}#${data.comment}`;

    return (
        <NavDropdown.Item as={Link} to={href}>{data.commentor} commented on your post!</NavDropdown.Item>
    )
}


export default CommentOnPost;
