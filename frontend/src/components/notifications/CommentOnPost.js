import { useEffect, useState } from "react";
import { Container, NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import EnsAndAddress from "../EnsAndAddress.js";
import PfpResolver from "../PfpResolver";


function CommentOnPost({data}) {

    // constants
    const href = `/posts/${data.post}#${data.comment}`;

    return (
        <Container>
            <PfpResolver
                address={data.commentor.address}
                imgUrl={data.commentor.image}
                height="50px"
                width="50px"
                fontSize="0.5rem"
            />
            <NavDropdown.Item as={Link} to={href}>
                <EnsAndAddress address={data.commentor} />
                &nbsp;commented on your post!
            </NavDropdown.Item>
        </Container>
    )
}


export default CommentOnPost;
