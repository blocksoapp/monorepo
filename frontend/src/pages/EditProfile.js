import React, { useState, useEffect, useContext } from "react";
import { Container } from "react-bootstrap";
import { baseAPI } from "../utils";
import { UserContext } from "../contexts/UserContext";
import EditProfileForm from "../components/profile/EditProfile/EditProfileForm";
import { apiGetUser } from "../api";

function EditProfile() {
  // Constant
  const { user, setUser } = useContext(UserContext);
  // State
  const [pfp, setPfp] = useState(null);
  const [profile, setProfile] = useState({
    image: "",
    bio: "",
    socials: {
      website: "",
      telegram: "",
      discord: "",
      twitter: "",
      opensea: "",
      looksrare: "",
      snapshot: "",
    },
  });
  const [formProfile, setFormProfile] = useState({
    image: "",
    bio: "",
    socials: {
      website: "",
      telegram: "",
      discord: "",
      twitter: "",
      opensea: "",
      looksrare: "",
      snapshot: "",
    },
  });

  const checkForProfile = async () => {
    const fetchUser = await apiGetUser();
    const res = await fetchUser.json();
    if (res.profile !== null) {
      // set profile fields to existing values
      var profileData = res.profile;
      delete profileData.posts;
      delete profileData.numFollowers;
      delete profileData.numFollowing;
      setProfile(profileData);
      return;
    } else console.log("profile does not exist");
  };

  // load existing profile data
  useEffect(() => {
    if (user && user.profile) {
      setProfile(user.profile);
    } else {
      checkForProfile();
    }
  }, []);

  useEffect(() => {
    setFormProfile(profile);
    setPfp(profile.image);
  }, [profile]);

  return (
    <div className="p-sm-4">
      <Container>
        <h2 className="fw-bold mb-5">Edit Your Blockso Profile</h2>
        <EditProfileForm
          profile={profile}
          setProfile={setProfile}
          formProfile={formProfile}
          setFormProfile={setFormProfile}
          checkForProfile={checkForProfile}
          pfp={pfp}
          setPfp={setPfp}
          setUser={setUser}
        />
      </Container>
    </div>
  );
}

export default EditProfile;
