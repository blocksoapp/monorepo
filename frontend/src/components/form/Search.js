import React from 'react'
import {
    Button,
    Form,
    FloatingLabel,
    InputGroup
} from 'react-bootstrap'

function Search() {
    return (
        <InputGroup style={{ placeContent: "center" }}>
            <FloatingLabel
                controlId="floatingInput"
                label="ENS or Wallet Address"
                className="mb-3"
            >
                {/* Type should be address or ENS */}
                <Form.Control type="text" placeholder="name.eth" />
            </FloatingLabel>

            {/* Onclick should fetch/return the top addresses */}
            <Button size="sm" className='mb-3'>Search</Button>
        </InputGroup>
      );
}

export default Search
