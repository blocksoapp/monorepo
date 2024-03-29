import React, { useState } from "react";
import { Container, Form, Button, Row, Col } from "react-bootstrap";
import { useAccount } from "wagmi";
import { baseAPI, getCookie } from "../../../utils";
import NftForm from "./NftForm";
import FileUpload from "./FileUpload";
import Loading from "../../ui/Loading";
import FormSocialLinks from "./FormSocialLinks";
import FormBio from "./FormBio";
import FormHeader from "./FormHeader";
import TabsComponent from "../../ui/Tabs";
import FormEns from "./FormEns";
import AlertComponent from "../../ui/AlertComponent";
import FormPfp from "./FormPfp";

function EditProfileForm({
  formProfile,
  setFormProfile,
  pfp,
  setPfp,
  user,
  setUser,
}) {
  const { isConnected } = useAccount();
  const [pfpPreview, setPfpPreview] = useState(null);
  const [isPfpRemoved, setIsPfpRemoved] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);


  // Form State Update
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormProfile((prevValue) => {
      return {
        ...prevValue,
        [name]: value,
      };
    });
  };

  // Form Submission Function
  const handleSubmit = async () => {
    if (!isConnected) return;
    setIsLoading(true);
    const url = `${baseAPI}/${user.address}/profile/`;
    const formRes = await fetch(url, {
      method: "PUT",
      body: JSON.stringify(formProfile),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFTOKEN": getCookie("csrftoken"),
      },
      credentials: "include",
    });
    if (formRes.ok) {
      setIsSuccess(true);
      setIsLoading(false);
      setUser((prevValue) => {
        return {
          ...prevValue,
          profile: formProfile,
        };
      });
    } else {
      setIsError(true);
      setIsLoading(false);
    }
    setPfpPreview(null);
    setIsPfpRemoved(null);
  };

  const removePfp = () => {
    setPfp("");
    setPfpPreview(null);
    // Set image to empty string
    setFormProfile((prevValue) => {
      return {
        ...prevValue,
        image: "",
      };
    });
    setIsPfpRemoved(true);
  };

  // Alerts for success & fail form submission
  const handleAlert = () => {
    if (isSuccess === true) {
      return (
        <AlertComponent
          show={isSuccess}
          color="success"
          heading="Success!"
          subheading="Aww yeah, you successfully made changes to your profile!
        Now go out there and use Blockso!"
        />
      );
    } else if (isError === true) {
      return (
        <AlertComponent
          isToggle={isError}
          setIsToggle={setIsError}
          color="danger"
          heading="Error!"
          subheading="Aww no, you unsuccessfully made changes to your profile!
        Make sure you are signed into Blockso and try again!"
        />
      );
    } else return;
  };

  return (
    <div className="p-3 border mb-5 mt-3">
      {!isLoading ? (
        <Container>
          <Form onSubmit={handleSubmit}>
            {handleAlert()}
            <Row>
              <Col className="d-flex justify-content-center p-2">
                {pfpPreview ? (
                  <div>
                    <FormPfp
                      pfp={pfpPreview}
                      pfpPreview={pfpPreview}
                      address={user.address}
                      removePfp={removePfp}
                      isPfpRemoved={isPfpRemoved}
                      isConnected={isConnected}
                    />
                  </div>
                ) : (
                  <div>
                    <FormPfp
                      pfp={pfp}
                      address={user.address}
                      removePfp={removePfp}
                      isPfpRemoved={isPfpRemoved}
                      isConnected={isConnected}
                    />
                  </div>
                )}
              </Col>
            </Row>

            <Row>
              <Col>
                <FormHeader
                  header="Profile Picture"
                  subheader="Upload a picture for your profile so everyone can tell who you are!"
                />
              </Col>
              <Col md={9}>
                <TabsComponent
                  firstTitle="Upload Image"
                  secondTitle="Use NFT"
                  thirdTitle="Use ENS Avatar"
                  firstPane={
                    <FileUpload
                      setProfile={setFormProfile}
                      setPfpPreview={setPfpPreview}
                      pfpPreview={pfpPreview}
                    />
                  }
                  secondPane={
                    <NftForm
                      setProfile={setFormProfile}
                      setPfpPreview={setPfpPreview}
                      pfpPreview={pfpPreview}
                    />
                  }
                  thirdPane={
                    <FormEns
                      address={user.address}
                      setProfile={setFormProfile}
                      profile={formProfile}
                      setPfpPreview={setPfpPreview}
                      pfpPreview={pfpPreview}
                    />
                  }
                />
              </Col>
            </Row>

            <Row>
              <Col>
                <FormHeader
                  header="About"
                  subheader="Tell us about yourself. We would love to know!"
                />
              </Col>
              <Col md={9}>
                <FormBio handleChange={handleChange} profile={formProfile} />
              </Col>
            </Row>

            <Row>
              <Col>
                <FormHeader
                  header="Social Profiles"
                  subheader="Where can people find you online? Including social profiles are completely optional."
                />
              </Col>
              <Col md={9}>
                <FormSocialLinks
                  setProfile={setFormProfile}
                  profile={formProfile}
                />

                <div className="mt-3 mb-3">
                  <Button
                    disabled={!isConnected}
                    variant="success"
                    type="submit"
                  >
                    Save Changes
                  </Button>
                  {!isConnected ? (
                    <Form.Text className="text-muted p-3">
                      Please connect to Metamask before submitting.
                    </Form.Text>
                  ) : (
                    ""
                  )}
                </div>
              </Col>
            </Row>
          </Form>
        </Container>
      ) : (
        <Loading />
      )}
    </div>
  );
}

export default EditProfileForm;
