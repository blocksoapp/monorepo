import React from 'react'
import { Form } from 'react-bootstrap'

function FormBio({ profile, handleChange }) {
  return (
    <div>
            <Form.Group className="mb-3 border p-3">
                <Form.Label className='fw-bold'>Your Bio</Form.Label>
                <Form.Control onChange={handleChange} name="bio" as="textarea" rows={3} value={profile.bio} type="text" placeholder="" />
            </Form.Group>
    </div>
  )
}

export default FormBio