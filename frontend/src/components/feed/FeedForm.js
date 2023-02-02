import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import AlertComponent from '../ui/AlertComponent';


function FeedForm({feed, handleSubmit, handleCancel}) {

    // state
    const [name, setName] = useState(feed?.name);
    const [description, setDescription] = useState(feed?.description);
    const [followingEditableByPublic, setFollowingEditableByPublic] = useState(feed?.followingEditableByPublic);
    const [image, setImage] = useState(feed?.image);

    return (
        <Form>
            {/* Image */}
            <Form.Group className="my-2" controlId="formImage">
                <Form.Label>Image</Form.Label>
                <Form.Control type="text" placeholder="Enter image" value={image} onChange={(e) => setImage(e.target.value)} />
            </Form.Group>

            {/* Name */}
            <Form.Group className="my-2" controlId="formName">
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} />
            </Form.Group>

            {/* Description */}
            <Form.Group className="my-2" controlId="formDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control type="text" placeholder="Enter description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </Form.Group>

            {/* Feed following is editable by public */}
            <Form.Group className="my-3" controlId="formFeedFollowingEditable">
                <Form.Check
                    type="checkbox" label="Public can edit profiles on feed?"
                    checked={followingEditableByPublic}
                    onChange={(e) => setFollowingEditableByPublic(e.target.checked)}
                />
            </Form.Group>

            {/* Buttons */}
            <Form.Group className="my-1" controlId="formButtons">
                <Button
                    variant="outline-primary"
                    className="me-2"
                    onClick={() => handleSubmit(
                        {name, description, image, followingEditableByPublic}
                    )}
                >
                Submit
                </Button>
                <Button variant="outline-secondary" onClick={() => handleCancel()}>Cancel</Button>
            </Form.Group>
        </Form>
    );
}


export default FeedForm;
