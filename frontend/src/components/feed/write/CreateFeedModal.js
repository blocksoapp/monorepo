import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import { apiPostFeed } from '../../../api';
import FeedForm from './FeedForm';


const CreateFeedModal = ({ show, setShow }) => {
    // hooks
    const navigate = useNavigate();
    
    // functions
    const handleSubmit = async (data) => {
        // make request to create feed
        const resp = await apiPostFeed(data);

        // handle success
        if (resp.ok) {
            // take user to view their feed
            const feed = await resp.json();
            navigate(`/feeds/${feed.id}`);
        }
        
        // handle error
        else {
            //TODO
            console.error(resp);
        }
    };

    const handleCancel = () => {
        setShow(false);
    };
    
    // render
    return (
        <Modal show={show} onHide={() => setShow(false)}>
            {/* Modal Header */}
            <Modal.Header closeButton>
                <Modal.Title>Create a new feed</Modal.Title>
            </Modal.Header>

            {/* Modal Body */}
            <Modal.Body>
                <FeedForm
                    handleSubmit={handleSubmit}
                    handleCancel={handleCancel}
                    isCreate={true}
                />
            </Modal.Body>

        </Modal>
    );
};

export default CreateFeedModal;
