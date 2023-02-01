import React, { useState, useEffect } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';


function FeedFollowingProfileInput({address, handleSubmit, handleDelete}) {
    // hooks
    const [inputAddress, setInputAddress] = useState(address);
    const [isChanged, setIsChanged] = useState(false);
    const [isValid, setIsValid] = useState(true);

    // handle input change
    const handleChange = (event) => {
        const value = event.target.value;
        setInputAddress(value);
        if (value !== address) {
            setIsChanged(true);
        }
        else {
            setIsChanged(false);
        }
    }

    /* Handle save.
     * If the address is valid, then it is saved.
     * If the address is invalid, then an invalid feedback is shown.
     */
    const handleSave = () => {
        // TODO validate address
        if (isValid) {
            handleSubmit(inputAddress);
            setIsValid(true);
            setIsChanged(false);
            setInputAddress("");
        }
        else {
            setIsValid(false);
        }
    }
    
    const handleTrash = () => {
        handleDelete(address);
    }

    /* Handle cancel.
     * Resets the input to the original address.
     */
    const handleCancel = () => {
        setInputAddress(address);
        setIsChanged(false);
    }


    // render
    return (
        <InputGroup className="mb-3">
            <Form.Control
                type="text"
                placeholder="0x..."
                value={inputAddress}
                onChange={handleChange}
                isInvalid={!isValid}
            />
            <Form.Control.Feedback type="invalid">
                Invalid address
            </Form.Control.Feedback>
            {isChanged ? (
                <InputGroup.Text>
                    <Button variant="outline-secondary" onClick={handleSave}>
                        Save
                    </Button>
                    <Button variant="outline-secondary" onClick={handleCancel}>
                        Cancel
                    </Button>
                </InputGroup.Text>
            ) : (
                <InputGroup.Text>
                    <Button variant="outline-secondary" onClick={handleTrash}>
                        <FontAwesomeIcon icon={faTrashAlt} />
                    </Button>
                </InputGroup.Text>
            )}
        </InputGroup>
    );
}   


export default FeedFollowingProfileInput;
