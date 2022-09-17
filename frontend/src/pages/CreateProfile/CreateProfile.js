import React, {useState} from 'react'
import { Container, Form, Button, Row, Col } from 'react-bootstrap'


function CreateProfile() {
    const [profile, setProfile] = useState({
        image: '',
        bio: '',
        socials: {
            website: '',
            telegram: '',
            discord: '',
            twitter: '',
            opensea: '',
            looksrare: '',
            snapshot: ''
        }
    })

  return (
    <>
        <Container className='p-3'>
            <Form>
            <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>Avatar</Form.Label>
                <Form.Control type="file" size="sm" />
                <Form.Text className="text-muted">
                Upload an avatar for your profile.
                </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBio">
                <Form.Label>Bio</Form.Label>
                <Form.Control type="text" placeholder="" />
                <Form.Text className="text-muted">
                Tell us a little about yourself.
                </Form.Text>
            </Form.Group>

            <div className="border p-3">
                <h3>Add Socials (optional):</h3>
                <Form.Group className="mb-3" controlId="website">
                <Form.Label>Website</Form.Label>
                <Form.Control type="text" size="sm" placeholder="" />
                </Form.Group>

                <Row>

                    <Col>
                        <Form.Group className="mb-3" controlId="">
                        <Form.Label>Twitter</Form.Label>
                        <Form.Control type="text" size="sm" placeholder="" />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="">
                        <Form.Label>Telegram</Form.Label>
                        <Form.Control type="text" size="sm" placeholder="" />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="">
                        <Form.Label>Discord</Form.Label>
                        <Form.Control type="text" size="sm" placeholder="" />
                        </Form.Group>
                    </Col>

                    <Col>
                        <Form.Group className="mb-3" controlId="">
                        <Form.Label>Opensea</Form.Label>
                        <Form.Control type="text" size="sm" placeholder="" />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="">
                            <Form.Label>LooksRare</Form.Label>
                            <Form.Control type="text" size="sm" placeholder="" />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="">
                            <Form.Label>Snapshot</Form.Label>
                            <Form.Control type="text" size="sm" placeholder="" />
                        </Form.Group>
                    </Col>

                 </Row>
            </div>
            <Button variant="primary" type="submit">
                Submit
            </Button>
            </Form>
        </Container>
    </>
  )
}

export default CreateProfile