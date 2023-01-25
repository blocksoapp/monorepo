import React, { useContext } from "react";
import { ProfileContext } from "../../contexts/ProfileContext";
import { Col, Nav, Row, Tab } from "react-bootstrap";

function LeftTabs(props) {
  const { profileData } = useContext(ProfileContext);

  return (
    <Tab.Container id="left-tabs-example" defaultActiveKey={props.activeTab}>
      <Row>
        <Col md={3}>
          <Nav variant="pills" className="flex-column">
            <Nav.Item>
              <Nav.Link eventKey="first" className="">
                {profileData.numFollowers} Followers
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="second">
                {profileData.numFollowing} Following
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>
        <Col md={9}>
          <Tab.Content>
            <Tab.Pane eventKey="first">{props.firstTab}</Tab.Pane>
            <Tab.Pane eventKey="second">{props.secondTab}</Tab.Pane>
          </Tab.Content>
        </Col>
      </Row>
    </Tab.Container>
  );
}

export default LeftTabs;
