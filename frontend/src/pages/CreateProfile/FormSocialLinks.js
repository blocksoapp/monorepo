import React from 'react'
import { Form, Row, Col } from 'react-bootstrap'

function FormSocialLinks({ handleChange, profile }) {
  return (
    <div className="border p-3">
    <Form.Label>Add Links</Form.Label>
    <Form.Group className="mb-3" controlId="website">
    <Form.Label>Website</Form.Label>
    <Form.Control onChange={handleChange} name="website" value={profile.socials.website} type="text" size="sm" placeholder="" />
    </Form.Group>

    <Row>

        <Col>
            <Form.Group className="mb-3">
            <Form.Label>Twitter</Form.Label>
            <Form.Control onChange={handleChange} name="twitter" value={profile.socials.twitter} type="text" size="sm" placeholder="" />
            </Form.Group>

            <Form.Group className="mb-3">
            <Form.Label>Telegram</Form.Label>
            <Form.Control onChange={handleChange} name="telegram" value={profile.socials.telegram} type="text" size="sm" placeholder="" />
            </Form.Group>

            <Form.Group className="mb-3">
            <Form.Label>Discord</Form.Label>
            <Form.Control onChange={handleChange} name="discord" value={profile.socials.discord} type="text" size="sm" placeholder="" />
            </Form.Group>
        </Col>

        <Col>
            <Form.Group className="mb-3">
            <Form.Label>Opensea</Form.Label>
            <Form.Control onChange={handleChange} name="opensea" value={profile.socials.opensea} type="text" size="sm" placeholder="" />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>LooksRare</Form.Label>
                <Form.Control onChange={handleChange} name="looksrare" value={profile.socials.looksrare} type="text" size="sm" placeholder="" />
            </Form.Group>

            <Form.Group>
                <Form.Label>Snapshot</Form.Label>
                <Form.Control onChange={handleChange} name="snapshot" value={profile.socials.snapshot} type="text" size="sm" placeholder="" />
            </Form.Group>
        </Col>
        <Form.Text className="text-muted">
        Adding links are optional.
        </Form.Text>

    </Row>
</div>
  )
}

export default FormSocialLinks