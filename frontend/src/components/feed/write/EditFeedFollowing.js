import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Col, Container, Form, Row } from "react-bootstrap";
import {
    apiDeleteFeedFollowing,
    apiGetFeedFollowing,
    apiGetUrl,
    apiPostFeedFollowing
} from "../../../api";
import FeedFollowingProfileInput from "./FeedFollowingProfileInput";
import PaginateButton from "../../ui/PaginateButton";


function EditFeedFollowing() {
    // hooks
    const { feedId } = useParams();

    // state
    const [profiles, setProfiles] = useState([]);
    const [profilesNextPage, setProfilesNextPage] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    /*
     * Fetch the list of profiles that the feed is following.
     */
    const fetchFeedFollowing = async () => {
        const resp = await apiGetFeedFollowing(feedId);

        // handle success
        if (resp.ok) {
            const data = await resp.json();
            setProfiles(data["results"]);
            setProfilesNextPage(data["next"]);
        }

        // handle failure
        else {
            console.error(resp);
            setError("Error fetching profiles that the feed follows");
        }
    };

    /*
     * Add a new profile to the list of profiles that the feed is following.
     */
    const handleSubmit = async (address) => {
        setError("");
        setSuccess("");

        // check if the profile is already in the list
        if (profiles.some(profile => profile.address === address)) {
            setError("Profile already in list");
            return;
        }

        // add the profile to the list
        const resp = await apiPostFeedFollowing(feedId, address);

        // handle success
        if (resp.ok) {
            const data = await resp.json();
            setProfiles([data].concat(profiles));
            setError("");
            setSuccess("Profile added");
        }

        // handle error
        else {
            console.error(resp);
            setError("Error adding profile");
            setSuccess("");
        }
    };

    /*
     * Remove a profile from the list of profiles that the feed is following.
     */
    const handleDelete = async (address) => {
        setError("");
        setSuccess("");

        const resp = await apiDeleteFeedFollowing(feedId, address);

        // handle success
        if (resp.ok) {
            setProfiles(
                profiles.filter(profile => profile.address !== address)
            );
            setError("");
            setSuccess("Profile deleted");
        }

        // handle error
        else {
            console.error(resp);
            setError("Error deleting profile");
            setSuccess("");
        }
    };

    // effects
    useEffect(() => {
        fetchFeedFollowing();

        return () => {
            setProfiles([]);
            setProfilesNextPage(null);
            setError("");
        }
    }, []);


    // render
    return (
        <Container className="my-5">
            <p className="fs-2 text-muted">This feed follows...</p>
            <Form>
                {/* show error/success */}
                {error && <p className="text-danger">{error}</p>}
                {success && <p className="text-success">{success}</p>}

                <FeedFollowingProfileInput
                    address=""
                    handleSubmit={handleSubmit}
                    handleDelete={handleDelete}
                />

                {profiles.map((profile, index) => (
                    <FeedFollowingProfileInput
                        key={index}
                        address={profile.address}
                        handleSubmit={handleSubmit}
                        handleDelete={handleDelete}
                    />
                ))}

                {/* show more profiles button */}
                <Row className="justify-content-start mb-3">
                    <Col className="col-auto">
                        <PaginateButton
                            url={profilesNextPage}
                            items={profiles}
                            callback={setProfiles}
                            text="Show More"
                            variant="outline-primary"
                        />
                    </Col>
                </Row>
            </Form>
        </Container>
    );
}

export default EditFeedFollowing;
