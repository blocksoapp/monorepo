import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { Container } from "react-bootstrap";
import FollowNav from "./FollowNav";
import FollowCard from "./FollowCard";
import "./follow-custom.css";
import { apiGetFollowers, apiGetUrl } from "../../api";
import FollowPlaceholder from "./FollowPlaceholder";
import FollowError from "./FollowError";
import MoreFollow from "./MoreFollow";

function Followers() {
  const [followers, setFollowers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [active, setActive] = useState(true);
  const [followError, setFollowError] = useState(false);
  const [followersNextPage, setFollowersNextPage] = useState(null);
  const [moreFollowersLoading, setMoreFollowersLoading] = useState(false);
  const [moreFollowersError, setMoreFollowersError] = useState(false);
  const { urlInput } = useParams();

  const fetchFollowers = async () => {
    setIsLoading(true);
    const resp = await apiGetFollowers(urlInput);
    if (resp.ok) {
      const json = await resp.json();
      setFollowers(json.results);
      setFollowersNextPage(json["next"]);
      setIsLoading(false);
    } else if (!resp.ok) {
      setIsLoading(false);
      setFollowError(true);
      console.log("couldnt fetch followers");
    }
  };

  const fetchMoreFollowers = async () => {
    setMoreFollowersLoading(true);
    const resp = await apiGetUrl(followersNextPage);

    if (resp.ok) {
      var data = await resp.json();
      setFollowers(followers.concat(data["results"]));
      setMoreFollowersError(false);
      setMoreFollowersLoading(false);
      setFollowersNextPage(data["next"]);
    } else {
      setMoreFollowersError(true);
      setMoreFollowersLoading(false);
      console.error(resp);
    }
  };

  useEffect(() => {
    fetchFollowers();
  }, []);

  return (
    <Container className="border p-0">
      <FollowNav address={urlInput} active={active} />
      {isLoading ? (
        <FollowPlaceholder />
      ) : followError ? (
        <FollowError retryAction={fetchFollowers} />
      ) : (
        <>
          {followers === undefined || followers.length === 0 ? (
            <p className="fs-2 text-center align-item-center p-2">
              No results.
            </p>
          ) : (
            followers.map((follower, index) => {
              return (
                <FollowCard
                  key={index}
                  imgUrl={follower.image}
                  address={follower.address}
                  bio={follower.bio}
                  followedByMe={follower.followedByMe}
                  numFollowers={follower.numFollowers}
                  showFollowButton={true}
                />
              );
            })
          )}
        </>
      )}

      {/* More Following (pagination) */}
      {followersNextPage === null ? (
        <></>
      ) : moreFollowersLoading === true ? (
        <FollowPlaceholder />
      ) : moreFollowersError === true ? (
        <FollowError retryAction={fetchFollowers} />
      ) : (
        <MoreFollow action={fetchMoreFollowers} />
      )}
    </Container>
  );
}

export default Followers;
