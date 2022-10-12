import {Spinner, Container} from 'react-bootstrap';

function Loading() {
  return (
    <Container className="fullheight-container d-flex justify-content-center align-items-center">
        <Spinner animation="border" />
    </Container>
  )
}

export default Loading;