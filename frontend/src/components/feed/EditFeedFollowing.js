/*
 * EditFeedFollowing is a functional react component that renders a form
 * that allows the user to edit the profiles that the feed is following.
 * The list of profiles that the feed is following is fetched from an API.
 * The user can add or remove profiles from the list.
 * Each profile in the list is stored in an input field.
 * When an input field is saved, a new input field appears below it.
 */
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
        }

        // handle failure
        else {
            //TODO
            console.error(resp);
        }
    };


    /*
     * Add a new profile to the list of profiles that the feed is following.
     */
    const handleSubmit = async (address) => {
        const resp = await apiPostFeedFollowing(feedId, address);

        // handle success
        if (resp.ok) {
            const data = await resp.json();
            setProfiles([...profiles, data]);
        }

        // handle error
        else {
            //TODO
            console.error(resp);
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
            //TODO
            console.error(resp);
        }
    };

    // effects
    useEffect(() => {
        fetchFeedFollowing();
    }, []);

    // render
    return (
        <Container>
            <h1>Edit Feed Following</h1>
            <Form>
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
