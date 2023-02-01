import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';


function FeedForm({feed, handleSubmit, handleCancel}) {

    // state
    const [name, setName] = useState(feed?.name);
    const [description, setDescription] = useState(feed?.description);
    const [image, setImage] = useState(feed?.image);

    return (
        <Form>
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

            {/* Image */}
            <Form.Group className="my-2" controlId="formImage">
                <Form.Label>Image</Form.Label>
                <Form.Control type="text" placeholder="Enter image" value={image} onChange={(e) => setImage(e.target.value)} />
            </Form.Group>

            {/* Buttons */}
            <Button variant="primary" onClick={() => handleSubmit({name, description, image})}>Submit</Button>
            <Button variant="secondary" onClick={() => handleCancel()}>Cancel</Button>
        </Form>
    );
}


export default FeedForm;
