import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';

function LeftTabs(props) {
  return (
    <Tab.Container id="left-tabs-example" defaultActiveKey={props.activeTab}>
      <Row>
        <Col md={3}>
          <Nav variant="pills" className="flex-column">
            <Nav.Item>
              <Nav.Link eventKey="first" className=''>Followers</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="second">Following</Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>
        <Col md={9}>
          <Tab.Content>
            <Tab.Pane eventKey="first">
              {props.firstTab}
            </Tab.Pane>
            <Tab.Pane eventKey="second">
              {props.secondTab}
            </Tab.Pane>
          </Tab.Content>
        </Col>
      </Row>
    </Tab.Container>
  );
}

export default LeftTabs;
