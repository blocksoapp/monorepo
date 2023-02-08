import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Form } from "react-bootstrap";
import {
    apiDeleteFeedFollowing,
    apiGetFeedFollowing,
    apiGetUrl,
    apiPostFeedFollowing
} from "../../api";
import FeedFollowingProfileInput from "./FeedFollowingProfileInput";
import MoreProfilesButton from "./MoreProfilesButton";


function EditFeedFollowing() {
    // hooks
    const { feedId } = useParams();

    // state
    const [profiles, setProfiles] = useState([]);
    const [error, setError] = useState("");
    const [profilesNextPage, setProfilesNextPage] = useState(null);
    const [moreProfilesLoading, setMoreProfilesLoading] = useState(false);
    const [moreProfilesError, setMoreProfilesError] = useState("");

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
     * Paginate through the profiles that the feed is following.
     */
    const fetchMoreFeedFollowing = async () => {
        const resp = await apiGetUrl(profilesNextPage);

        // handle success
        if (resp.ok) {
            const data = await resp.json();
            setProfiles(profiles.concat(data["results"]));
            setProfilesNextPage(data["next"]);
            setMoreProfilesLoading(false);
            setMoreProfilesError("");
        }

        // handle failure
        else {
            console.error(resp);
            setMoreProfilesError("Error fetching profiles that the feed follows");
            setMoreProfilesLoading(false);
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
        <Container className="my-5">
            <p className="fs-2 text-muted">This feed follows...</p>
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

                {/* show more profiles button */}
                {profilesNextPage === null
                    ? <></>
                    : moreProfilesLoading === true
                        ? <p>Loading...</p>
                        : moreProfilesError !== ""
                            ? <p className="text-danger">{moreProfilesError}</p>
                            : <MoreProfilesButton retryAction={fetchMoreFeedFollowing} />
                }

            </Form>
        </Container>
    );
}

export default EditFeedFollowing;
