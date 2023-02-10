import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { apiPutFeedImage } from '../../../api';
import AlertComponent from '../../ui/AlertComponent';
import FIleUpload from '../../profile/EditProfile/FileUpload';
import EditFeedPfp from './EditFeedPfp';


function FeedForm({feed, handleSubmit, handleCancel, isCreate}) {

    // state
    const [name, setName] = useState(feed?.name);
    const [description, setDescription] = useState(feed?.description);
    const [followingEditableByPublic, setFollowingEditableByPublic] = useState(feed?.followingEditableByPublic);
    const [image, setImage] = useState(feed?.image);


    // render
    return (
        <Form>
            {/* Image only shown in Edit Mode */}
            {!isCreate && <EditFeedPfp feed={feed} image={image} setImage={setImage} />}

            {/* Name */}
            <Form.Group className="mt-4 mb-2" controlId="formName">
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
