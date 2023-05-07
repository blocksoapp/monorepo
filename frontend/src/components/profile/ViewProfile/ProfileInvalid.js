import { Col, Container, Image, Row } from "react-bootstrap";

function ProfileInvalid(props) {
  return (
    <Container fluid>
      {/* User Info Section */}
      <Container className="border-bottom border-light">
        {/* Profile picture */}
        <Row className="justify-content-center">
          <Col className="col-auto">
            <Image
              className="bg-secondary mb-1"
              roundedCircle
              height="133.5px"
              width="133.5px"
            />
          </Col>
        </Row>

        {/* Address and ENS */}
        <Row className="justify-content-center mt-2">
          <Col className="col-auto text-center">
            <h5>Invalid address {props.address}</h5>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}

export default ProfileInvalid;
