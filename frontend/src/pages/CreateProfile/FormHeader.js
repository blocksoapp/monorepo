import React from 'react'
import { Form } from 'react-bootstrap'

function FormHeader(props) {
  return (
    <div className='d-flex flex-column'>
        <Form.Label className="fw-bold">{props.header}</Form.Label>
        <Form.Text className="text-muted">
            {props.subheader}
        </Form.Text>
    </div>
  )
}

export default FormHeader