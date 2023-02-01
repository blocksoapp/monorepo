import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Form } from "react-bootstrap";
import {
    apiDeleteFeedFollowing,
    apiGetFeedFollowing,
    apiPostFeedFollowing
} from "../../api";
import FeedFollowingProfileInput from "./FeedFollowingProfileInput";


function EditFeedFollowing() {
    // hooks
    const { feedId } = useParams();

    // state
    const [profiles, setProfiles] = useState([]);
    const [error, setError] = useState("");

    /*
     * Fetch the list of profiles that the feed is following.
     */
    const fetchFeedFollowing = async () => {
        const resp = await apiGetFeedFollowing(feedId);

        // handle success
        if (resp.ok) {
            const data = await resp.json();
            setProfiles(data["results"]);
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
        }

        // handle error
        else {
            console.error(resp);
            setError("Error adding profile");
        }
    };

    /*
     * Remove a profile from the list of profiles that the feed is following.
     */
    const handleDelete = async (address) => {
        const resp = await apiDeleteFeedFollowing(feedId, address);

        // handle success
        if (resp.ok) {
            setProfiles(
                profiles.filter(profile => profile.address !== address)
            );
        }

        // handle error
        else {
            console.error(resp);
            setError("Error deleting profile");
        }
    };

    // effects
    useEffect(() => {
        fetchFeedFollowing();

        return () => {
            setProfiles([]);
            setError("");
        }
    }, []);

    // render
    return (
        <Container>
            <h1>Edit Feed Following</h1>
            <Form>
                {/* show error */}
                {error && <p className="text-danger">{error}</p>}

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
            </Form>
        </Container>
    );
}

export default EditFeedFollowing;
