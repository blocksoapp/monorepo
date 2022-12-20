import React, { useState, useEffect, useContext } from "react";
import { Container } from "react-bootstrap";
import { UserContext } from "../contexts/UserContext";
import EditProfileForm from "../components/profile/EditProfile/EditProfileForm";

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

  const loadProfile = async () => {
    if (user && user.profile) {
      var profileData = user.profile;
      delete profileData.posts;
      delete profileData.numFollowers;
      delete profileData.numFollowing;
      setProfile(profileData);
      setPfp(profileData.image);
    } else {
      console.log("No profile found");
    }
  };

  // load existing profile data
  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    loadProfile();
  }, [user]);

  return (
    <div className="p-sm-4">
      <Container>
        <h2 className="fw-bold mb-5">Edit Your Blockso Profile</h2>
        <EditProfileForm
          profile={profile}
          setProfile={setProfile}
          formProfile={profile}
          setFormProfile={setProfile}
          pfp={pfp}
          setPfp={setPfp}
          setUser={setUser}
        />
      </Container>
    </div>
  );
}

export default EditProfile;
