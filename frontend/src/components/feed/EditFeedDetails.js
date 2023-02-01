import { useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import { apiPutFeed } from '../../api';
import FeedForm from './FeedForm';


function EditFeedDetails({feed}) {

    // hooks
    const navigate = useNavigate();

    // functions

    /*
     * Handles updating the feed details.
     */
    const handleSubmit = async (values) => {
        const resp = await apiPutFeed(values);
        if (resp.ok) {
            const data = await resp.json();
            console.log(data);
        }
        else {
            console.error(resp);
        }
    }

    /* Handles canceling editing the feed details. */
    const handleCancel = () => {
        navigate(`/feeds/${feed.id}`);
    }


    // render
    return (
        <Container>
            <h1>Edit Feed Details</h1>
            <FeedForm
                feed={feed}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
            />
        </Container>
    );
}


export default EditFeedDetails;
