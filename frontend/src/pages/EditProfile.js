import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import { useUser } from "../hooks/useUser";
import EditProfileForm from "../components/profile/EditProfile/EditProfileForm";
import MainHeader from "../components/ui/MainHeader";

function EditProfile() {
  // Constant
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  // State
  const [pfp, setPfp] = useState(null);
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
      setFormProfile(profileData);
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

  // Redirect to home page on disconnect
  useEffect(() => {
    if (!user) {
      return navigate("/");
    }
  }, [user]);

  return (
    <div className="">
      <MainHeader header="Edit Profile" />
      <Container>
        {user ? (
          <EditProfileForm
            formProfile={formProfile}
            setFormProfile={setFormProfile}
            pfp={pfp}
            setPfp={setPfp}
            setUser={setUser}
            user={user}
          />
        ) : (
          <h1>Please sign in...</h1>
        )}
      </Container>
    </div>
  );
}

export default EditProfile;
