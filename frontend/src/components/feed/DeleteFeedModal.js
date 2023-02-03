import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { apiDeleteFeed } from '../../api';



const DeleteFeedModal = ({ feedId, show, setShow }) => {
    // hooks
    const navigate = useNavigate();
    
    // state
    const [error, setError] = useState(false);

    // functions
    const handleDelete = async () => {
        // make request to delete feed
        const resp = await apiDeleteFeed(feedId);

        // handle success
        if (resp.ok) {
            // take user back to the feeds page
            navigate(`/feeds`);
        }
        
        // handle error
        else {
            console.error(resp);
            setError("There was an error deleting the feed.");
        }
    };

    const handleCancel = () => {
        setShow(false);
        setError("");
    };
    

    // render
    return (
        <Modal show={show} onHide={() => setShow(false)}>
            {/* Modal Header */}
            <Modal.Header closeButton>
                <Modal.Title>Delete feed</Modal.Title>
            </Modal.Header>

            {/* Modal Body */}
            <Modal.Body>
                <p>Are you sure you want to delete this feed?</p>

                <Form>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Button variant="danger" className="me-1" onClick={handleDelete}>Delete</Button>
                    <Button variant="outline-secondary" onClick={handleCancel}>Cancel</Button>
                </Form>
            </Modal.Body>

        </Modal>
    );
};

export default DeleteFeedModal;
