import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container } from "react-bootstrap";
import FollowCard from "./FollowCard";
import "./follow-custom.css";
import { apiGetFollowing, apiGetUrl } from "../../api";
import FollowPlaceholder from "./FollowPlaceholder";
import FollowError from "./FollowError";
import MoreFollow from "./MoreFollow";

function Following() {
  const [followingList, setFollowingList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [followingError, setFollowingError] = useState(false);
  const [followingNextPage, setFollowingNextPage] = useState(null);
  const [moreFollowingLoading, setMoreFollowingLoading] = useState(false);
  const [moreFollowingError, setMoreFollowingError] = useState(false);
  const { urlInput } = useParams();

  const fetchFollowing = async () => {
    setIsLoading(true);
    const resp = await apiGetFollowing(urlInput);
    if (resp.ok) {
      const json = await resp.json();
      setFollowingList(json.results);
      setFollowingNextPage(json["next"]);
      setIsLoading(false);
    } else if (!resp.ok) {
      setIsLoading(false);
      setFollowingError(true);
      console.log("couldnt fetch followingList");
    }
  };

  const fetchMoreFollowing = async () => {
    setMoreFollowingLoading(true);
    const resp = await apiGetUrl(followingNextPage);

    if (resp.ok) {
      var data = await resp.json();
      setFollowingList(followingList.concat(data["results"]));
      setMoreFollowingError(false);
      setMoreFollowingLoading(false);
      setFollowingNextPage(data["next"]);
    } else {
      setMoreFollowingError(true);
      setMoreFollowingLoading(false);
      console.error(resp);
    }
  };

  useEffect(() => {
    fetchFollowing();
  }, []);

  return (
    <Container className="following-container">
      {isLoading ? (
        <FollowPlaceholder />
      ) : followingError ? (
        <FollowError retryAction={fetchFollowing} />
      ) : (
        <>
          {followingList === undefined || followingList.length === 0 ? (
            <p className="fs-2 text-center align-item-center p-2">
              No results.
            </p>
          ) : (
            followingList.map((following, index) => {
              return (
                <FollowCard
                  key={index}
                  imgUrl={following.image}
                  address={following.address}
                  bio={following.bio}
                  followedByMe={following.followedByMe}
                  numFollowers={following.numFollowers}
                  showFollowButton={true}
                  showBio={true}
                />
              );
            })
          )}
        </>
      )}

      {/* More Following (pagination) */}
      {followingNextPage === null ? (
        <></>
      ) : moreFollowingLoading === true ? (
        <FollowPlaceholder />
      ) : moreFollowingError === true ? (
        <FollowError retryAction={fetchFollowing} />
      ) : (
        <MoreFollow action={fetchMoreFollowing} />
      )}
    </Container>
  );
}

export default Following;
