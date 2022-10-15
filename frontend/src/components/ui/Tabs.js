import { Tabs, Tab } from 'react-bootstrap';


function TabsComponent(props) {
  return (
    <Tabs
      defaultActiveKey="first"
      className="mb-3"
    >
      <Tab eventKey="first" title={props.firstTitle} className='tab-min-height border mb-3'>
        {props.firstPane}
      </Tab>
      <Tab eventKey="second" title={props.secondTitle} className='tab-min-height border mb-3'>
        {props.secondPane}
      </Tab>
      <Tab eventKey="third" title={props.thirdTitle} className='tab-min-height border mb-3'>
        {props.thirdPane}
      </Tab>
    </Tabs>
  );
}

export default TabsComponent;