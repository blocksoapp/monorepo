import { Col, Nav, Row, Tab } from 'react-bootstrap'

function TabsComponent(props) {
  return (
    <Tab.Container id="left-tabs-example" defaultActiveKey="first">
      <Row>
        <Col sm={2}>
          <Nav variant="pills" className="flex-column">
            <Nav.Item>
              <Nav.Link eventKey="first">{props.firstTitle}</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="second">{props.secondTitle}</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="third">{props.thirdTitle}</Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>
        <Col sm={10}>
          <Tab.Content>
            <Tab.Pane eventKey="first">
              {props.firstPane}
            </Tab.Pane>
            <Tab.Pane eventKey="second">
              {props.secondPane}
            </Tab.Pane>
            <Tab.Pane eventKey="third">
              {props.thirdPane}
            </Tab.Pane>
          </Tab.Content>
        </Col>
      </Row>
    </Tab.Container>
  );
}

export default TabsComponent;