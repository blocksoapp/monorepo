import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Col, Container, NavDropdown, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import EnsAndAddress from "../EnsAndAddress.js";
import PfpResolver from "../PfpResolver";


function CommentOnPost({data}) {

    // constants
    const href = `/posts/${data.post}#${data.comment}`;
    const navigate = useNavigate();

    // functions
    const getTimeAgo = (timestamp) => {
        // get difference between now and timestamp
        const backThen = new Date(timestamp);
        const diff = Date.now() - backThen;  // milliseconds

        // intervals to compare with
        const secondInMillis = 1000;
        const minuteInMillis = 60 * 1000;
        const hourInMillis = minuteInMillis * 60; 
        const dayInMillis = hourInMillis * 24; 

        // between 0s and 1m ago, show as 59s
        if (diff >= 0 && diff < minuteInMillis) {
            return `${parseInt(diff/secondInMillis)}s`;
        }
        // between 1m and 1h ago, show as 59m
        if (diff >= minuteInMillis && diff < hourInMillis) {
            return `${parseInt(diff/minuteInMillis)}m`;
        }
        // more than 1 hour ago, show as 23h
        if (diff >= hourInMillis && diff < dayInMillis) {
            return `${parseInt(diff/hourInMillis)}h`;
        }
        // more than 1 day ago, show as Nov. 7
        if (diff >= dayInMillis) {
            return backThen.toLocaleDateString("en-US", {
                month: 'short',
                day: 'numeric'
            });
        }
    }


    return (
        <Container
            className="p-2 notif-item"
            style={{ backgroundColor: data.viewed ? "transparent" : "#fffff0" }}
            onClick={() => navigate(href)}
        >
            <Row className="align-items-center">
                {/* avatar */}
                <Col xs={1}>
                    <PfpResolver
                        address={data.commentor.address}
                        imgUrl={data.commentor.image}
                        height="30px"
                        width="30px"
                        fontSize="0.5rem"
                    />
                </Col>

                {/* event description */}
                <Col xs={9} className="ps-3">
                    <span>
                        <EnsAndAddress address={data.commentor.address} />
                        &nbsp;commented on your post!
                    </span>
                </Col>

                {/* notification time */}
                <Col xs={2}>
                    <span className="text-muted">
                        {getTimeAgo(data.created)}
                    </span>
                </Col>
            </Row>
        </Container>
    )
}


export default CommentOnPost;
