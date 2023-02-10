import React, { useState, useEffect } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { utils as ethersUtils } from 'ethers';
import { useEnsName, useProvider } from 'wagmi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faTrashAlt } from '@fortawesome/free-solid-svg-icons';


function FeedFollowingProfileInput({address, handleSubmit, handleDelete}) {
    // hooks
    const provider = useProvider();
    const ensNameHook = useEnsName({address: address});                             

    // state
    const [inputAddress, setInputAddress] = useState(address);
    const [isChanged, setIsChanged] = useState(false);
    const [isValid, setIsValid] = useState(true);

    // functions

    /*
     * Handle change of input.
     */
    const handleChange = (event) => {
        const value = event.target.value;

        if (value !== address) {
            setInputAddress(value);
            setIsChanged(true);
        }
        else {
            setIsChanged(false);
        }
    }

    /*
     * Handle enter button.
     */
    const handleHotkeys = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSave();
        }

        if (event.key === "Escape") {
            event.preventDefault();
            handleCancel();
        }
    }

    /* Handle save.
     * If the address is valid, then it is saved.
     * If the address is invalid, then an invalid feedback is shown.
     */
    const handleSave = async () => {
        // do nothing if input hasn't been changed
        if (!isChanged) return

        // start as invalid
        var addressToSave = inputAddress;
        var isValid = false;

        // resolve ENS name to an address
        if (addressToSave.endsWith(".eth")) {
            const resolvedAddress = await provider.resolveName(addressToSave);
            if (resolvedAddress) {
                addressToSave = resolvedAddress;
                isValid = true;
            }
        }
        // validate non-ENS address
        else {
            try {
                addressToSave = ethersUtils.getAddress(addressToSave);
                isValid = true;
            }
            catch (error) {
                console.error(error);
            }
        }

        // TODO check if address is already in the list

        // save address if valid
        if (isValid) {
            handleSubmit(addressToSave);
            setIsValid(true);
            setIsChanged(false);
            setInputAddress("");
        }
        else {
            setIsValid(false);
        }
    }
    
    /*
     * Handle deleting an address.
     */
    const handleTrash = () => {
        // do not delete if input is empty
        if (address === "") return

        handleDelete(address);
    }

    /* Handle cancel.
     * Resets the input to the original address.
     */
    const handleCancel = () => {
        setInputAddress(address);
        setIsValid(true);
        setIsChanged(false);
    }

    // effects

    /*
     * Resolve an address to an ENS name for display purposes.
     */
    useEffect(() => {                                                                   
        if (!ensNameHook.isLoading && ensNameHook.data !== null && !isChanged) {
            setInputAddress(ensNameHook.data);                                               
        }                                                                               
    }, [ensNameHook]);

    /*
     * Reset input to address if address changes.
     */
    useEffect(() => {
        if (address !== inputAddress) {
            setInputAddress(address);
            setIsValid(true);
            setIsChanged(false);
        }
    }, [address]);


    // render
    return (
        <InputGroup className="mb-3">
            <Form.Control
                type="text"
                placeholder="0x..."
                value={inputAddress}
                onChange={handleChange}
                onKeyDown={handleHotkeys}
                isInvalid={!isValid}
            />
            <Form.Control.Feedback type="invalid">
                Invalid address
            </Form.Control.Feedback>
            {isChanged ? (
                <InputGroup.Text>
                    <Button variant="outline-success" className="me-2" onClick={handleSave}>
                        <FontAwesomeIcon icon={faCheck} />
                    </Button>
                    <Button variant="outline-secondary" onClick={handleCancel}>
                        <FontAwesomeIcon icon={faTimes} />
                    </Button>
                </InputGroup.Text>
            ) : (
                <InputGroup.Text>
                    <Button variant="outline-danger" onClick={handleTrash}>
                        <FontAwesomeIcon icon={faTrashAlt} />
                    </Button>
                </InputGroup.Text>
            )}
        </InputGroup>
    );
}   


export default FeedFollowingProfileInput;
