import React from 'react'
import { Form } from 'react-bootstrap'

function FormHeader(props) {
  return (
    <div className='d-flex flex-column mb-3'>
        <Form.Label className="fw-bold mb-0">{props.header}</Form.Label>
        <Form.Text className="text-muted">
            {props.subheader}
        </Form.Text>
    </div>
  )
}

export default FormHeader