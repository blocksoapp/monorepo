import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { useLocation, useParams } from "react-router-dom";
import LeftTabs from "../components/ui/LeftTabs";
import Followers from "../components/follow/Followers";
import Following from "../components/follow/Following";
import FollowNav from "../components/follow/FollowNav";
import { apiGetProfile } from "../api";
import { ProfileContext } from "../contexts/ProfileContext";
function Follow() {
  // State
  const [profileData, setProfileData] = useState({});
  const [profileDataLoading, setProfileDataLoading] = useState(false);
  // Const
  const location = useLocation();
  const activeLeftTab = location.state?.activeLeftTab;
  const { urlInput } = useParams();

  // Fetch profile data
  const fetchProfile = async () => {
    setProfileDataLoading(true);
    const resp = await apiGetProfile(urlInput);
    if (resp.ok) {
      var data = await resp.json();
      setProfileData(data);
      setProfileDataLoading(false);
      console.log("profileData: ", profileData);
    } else {
      console.error(resp);
      setProfileDataLoading(false);
    }
  };

  // Fetch profile data on component load
  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <>
      <ProfileContext.Provider value={{ profileData, setProfileData }}>
        {profileDataLoading && profileData === {} ? (
          <Container className="pb-5">Loading...</Container>
        ) : (
          <Container className="pb-5">
            <FollowNav address={urlInput} />
            <LeftTabs
              firstTab={<Followers />}
              secondTab={<Following />}
              activeTab={activeLeftTab ? activeLeftTab : "first"}
            />
          </Container>
        )}
      </ProfileContext.Provider>
    </>
  );
}

export default Follow;
