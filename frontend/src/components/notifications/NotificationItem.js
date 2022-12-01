import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Col, Container, NavDropdown, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import EnsAndAddress from "../EnsAndAddress.js";
import PfpResolver from "../PfpResolver";
import EventResolver from "./EventResolver";


function NotificationItem({data}) {

    // constants
    const navigate = useNavigate();

    // state
    const [href, setHref] = useState("");

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
            onClick={() => navigate(href)}  // notification link
        >
            <Row className="align-items-center">
                {/* event avatar and description */}
                <Col xs={10}>
                    <EventResolver
                        data={data.events}
                        setHref={setHref}
                    />
                </Col>

                {/* notification time */}
                <Col xs={2} className="text-end">
                    <span className="text-muted">
                        {getTimeAgo(data.created)}
                    </span>
                </Col>
            </Row>
        </Container>
    )
}


export default NotificationItem;
