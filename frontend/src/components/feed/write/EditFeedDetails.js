import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import { apiPutFeed } from '../../../api';
import AlertComponent from '../../ui/AlertComponent';
import DeleteFeedButton from './DeleteFeedButton';
import FeedForm from './FeedForm';


function EditFeedDetails({feed}) {

    // hooks
    const navigate = useNavigate();

    // state
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);

    // functions

    /*
     * Handles updating the feed details.
     */
    const handleSubmit = async (values) => {
        // reset feedback
        setError(false);
        setSuccess(false);

        // update feed
        const resp = await apiPutFeed(feed.id, values);

        // handle success
        if (resp.ok) {
            const data = await resp.json();
            setSuccess(true);
            setError(false);
        }

        // handle error
        else {
            console.error(resp);
            setError(true);
            setSuccess(false);
        }
    }

    /* Handles canceling editing the feed details. */
    const handleCancel = () => {
        navigate(`/feeds/${feed.id}`);
        setSuccess(false);
        setError(false);
    }


    // render
    return (
        <Container>
            <h1 className="mb-4">Edit Feed Details</h1>
            {success && <AlertComponent show={true} color="success" subheading="Feed updated successfully." />}
            {error && <AlertComponent show={true} color="danger" subheading="There was an error updating the feed." />}
            <FeedForm
                feed={feed}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
            />
        </Container>
    );
}


export default EditFeedDetails;
