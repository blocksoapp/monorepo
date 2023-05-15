import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Col, Container, NavDropdown, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { getTimeAgo } from "../../utils";
import EnsAndAddress from "../EnsAndAddress.js";
import PfpResolver from "../PfpResolver";
import EventResolver from "./EventResolver";

function NotificationPageItem({ data }) {
  // constants
  const navigate = useNavigate();

  // state
  const [href, setHref] = useState("");

  // functions

  return (
    <Container
      className="notif-item notif-item-p border"
      style={{ backgroundColor: data.viewed ? "transparent" : "#fffff0" }}
      onClick={() => navigate(href)} // notification link
    >
      <Row className="align-items-center">
        {/* event avatar and description */}
        <Col xs={10}>
          <EventResolver data={data.events} setHref={setHref} />
        </Col>

        {/* notification time */}
        <Col xs={2} className="text-end">
          <span className="text-muted">
            {getTimeAgo(data.created, {
              month: "short",
              day: "numeric",
            })}
          </span>
        </Col>
      </Row>
    </Container>
  );
}

export default NotificationPageItem;
