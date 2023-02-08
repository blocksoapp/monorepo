/*
 * Functional react component that displays the feed's image, as well as the option to edit the feed's image.
 */
import { useEffect, useState } from 'react';
import { Button, Container, Form, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { apiDeleteFeedImage, apiPutFeedImage } from '../../api';
import useBreakpoint from "../../hooks/useBreakpoint";
import FeedPfp from './FeedPfp';



function EditFeedPfp({feed, image, setImage}) {
    // hooks
    const breakpoint = useBreakpoint();

    // state
    const [selectedFile, setSelectedFile] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState("");

    // functions

    /*
     * Set the selectedFile state to the file buffer.
     * This function is called when a file is selected.
     */
    const handleBufferChange = async (event) => {
        const buffer = event.target.files[0];
        setSelectedFile(buffer);

        const reader = new FileReader();
        setImagePreview(reader.readAsDataURL(buffer));
    }

    /*
     * Upload the image to the server.
     * This function is called when a file is selected and the save button is clicked.
     */
    const handleImageSubmit = async (event) => {
        setLoading("Uploading image...");

        // prepare request data
        const formData = new FormData();
        formData.append("image", selectedFile);

        // upload file
        const resp = await apiPutFeedImage(feed.id, formData);

        // handle success
        if (resp.ok) {
            const data = await resp.json();
            setSuccess("Image uploaded successfully!");
            setLoading("");
            setError("");
            setImage(data["image"]);
            setImagePreview("");
            setSelectedFile("");
        }

        // handle error
        else {
            console.error(resp);
            setError("Error uploading image.");
            setLoading("");
            setSuccess("");
            setImagePreview("");
            setSelectedFile("");
        }
    }

    /*
     * Delete the feed's image.
     * This function is called when the trash icon is clicked followed by the save button.
     */
    const handleImageDelete = async (event) => {
        setLoading("Deleting image...");

        // delete image
        const resp = await apiDeleteFeedImage(feed.id);

        // handle success
        if (resp.ok) {
            setSuccess("Image deleted successfully!");
            setLoading("");
            setError("");
            setImage("");
            setImagePreview("");
            setSelectedFile("");
        }

        // handle error
        else {
            console.error(resp);
            setError("Error deleting image.");
            setLoading("");
            setSuccess("");
        }
    }

    /*
     * Save the image when the save button is clicked.
     * If the trash icon was clicked, delete the image.
     */
    const handleSave = async (event) => {
        event.preventDefault();

        // if there is a buffer image, upload it
        if (selectedFile) {
            await handleImageSubmit();
        }

        // if the trash icon was clicked, delete the image
        if (imagePreview === "trash") {
            await handleImageDelete();
        }
    }

    /* 
     * Reset the state when the cancel button is clicked.
     */
    const handleCancel = async (event) => {
        event.preventDefault();

        // reset state
        setSelectedFile("");
        setImagePreview("");
        setSuccess("");
        setError("");
        setLoading("");
    }


    // effects

    /*
     * When the selectedFile state changes, create a preview of the file.
     */
    useEffect(() => {
        if (!selectedFile) return;

        // create preview of file
        const objectUrl = URL.createObjectURL(selectedFile);
        setImagePreview(objectUrl);

        // clean up on unmount
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile])


    // render
    return (
        <Container>
                <Row>
                    {/* feed image */}
                    <Col className="col-auto pe-0">
                        {/*
                          * Shows the current image or a placeholder if there is no image.
                          * Shows the preview image if a file is selected.
                          * Show the placeholder if the trashcan is clicked.
                          */}
                        <FeedPfp
                            imgUrl={
                                imagePreview
                                    ? imagePreview === "trash"
                                        ? ""
                                        : imagePreview
                                    : image
                            }
                            height={
                                breakpoint === "xs" 
                                    ? 100
                                    : 150
                            }
                            width={
                                breakpoint === "xs" 
                                    ? 100
                                    : 150
                            }
                        />
                    </Col>

                    {/* trash icon, only shown when an image already exists */}
                    <Col className="col-auto align-self-start ps-0">
                        {image &&
                            <span className="pointer" onClick={() => setImagePreview("trash")}>
                                <FontAwesomeIcon icon={faTrash} />
                            </span>}
                    </Col>

                    {/* file input */}
                    <Col className="align-self-center">
                        {loading && <p className="text-secondary">{loading}</p>}
                        {success && <p className="text-success">{success}</p>}
                        {error && <p className="text-danger">{error}</p>}
                        <Form.Control type="file" onChange={handleBufferChange} />
                        {imagePreview &&
                            <div>
                                <Button variant="success" className="mt-3" onClick={handleSave}>Save</Button>
                                <Button variant="outline-secondary" className="mt-3 ms-2" onClick={handleCancel}>Cancel</Button>
                            </div>}
                    </Col>
                </Row>
        </Container>
  );
}

export default EditFeedPfp;
