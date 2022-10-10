import React, { useEffect, useState } from 'react'
import { Container, Form, Button, Row, Col } from 'react-bootstrap'
import { baseAPI, getCookie } from '../../utils'
import NftForm from './NftForm'
import { useAccount } from 'wagmi'
import FileUpload from './FileUpload'
import CurrentPfp from './CurrentPfp'
import Loading from '../../components/ui/Loading'
import FormSocialLinks from './FormSocialLinks'
import FormBio from './FormBio'
import FormHeader from './FormHeader'

function CreateProfileForm({ profile, setProfile, initialState, getUser }) {

    const { isConnected, address } = useAccount();
    const [pfp, setPfp] = useState(null)
    const [userAddress, setUserAddress] = useState(profile.address)
    const [isLoading, setIsLoading] = useState(false)

     // Form State Update
     const handleChange = (event) => {
      const { name, value } = event.target
      setProfile(prevValue => {
          return {
              ...prevValue,
              [name]: value
          }
      })
      console.log(profile)
  } 

  
  // Form Submission Function
  const handleSubmit = async () => {
      if(!isConnected) return
      setIsLoading(true)
      const url = `${baseAPI}/${address}/profile/`
      const formRes = await fetch(url, {
          method: 'PUT',
          body: JSON.stringify(profile),
          headers: {
              'Content-Type': 'application/json',
              'X-CSRFTOKEN': getCookie('csrftoken')
            },
            credentials: 'include'
      })
      
      if(formRes.status === 200 || 201) {
        console.log('successfully posted data')
        setTimeout(() => {
            setIsLoading(false)
        }, 2000)
      } else {
        console.log('error posting data')
        setTimeout(() => {
                setIsLoading(false)
        }, 2000)
      }
  }

  const checkForProfile = async () => {
    const res = await getUser();
    if(res.profile !== null) {
      // set profile fields to existing values
      var profileData = res.profile;
      delete profileData.posts;
      delete profileData.numFollowers;
      delete profileData.numFollowing;
      setProfile(profileData);
      return
    } else console.log('profile does not exist')
  }
  

  // load existing profile data
  useEffect(() => {
      checkForProfile();
  }, [])

  useEffect(() => {
    setPfp(profile.image)
    setUserAddress(profile.address)
  
    return () => {
      console.log('profile image: ', pfp)
    }
  }, [profile])
  


  return (
    <div className="pt-5 pb-5">
        {!isLoading ? 
            <Container className='profile-form'>
                <Form>
                    <Row>
                        <Col>
                            <FormHeader
                            header="Profile Picture"
                            subheader="Upload a picture for your profile so everyone can tell who you are!"
                            />
                        </Col>

                        <Col md={9}>
                                <Col>
                                    <CurrentPfp
                                    pfp={pfp}
                                    userAddress={userAddress}/>
                                </Col>
                                <Col>
                                    <FileUpload
                                    profile={profile}
                                    setProfile={setProfile}/>
                                </Col>
                                <Col>
                                    <NftForm
                                    profile={profile}
                                    setProfile={setProfile}/>
                                </Col> 
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
                        <FormBio
                        handleChange={handleChange}
                        profile={profile} />
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
                            setProfile={setProfile}
                            profile={profile}
                            />
                        </Col>
                    </Row>

                    <div className='p-3'>
                        <Button disabled={!isConnected} variant="primary" onClick={handleSubmit}>
                            Submit
                        </Button> 
                        {!isConnected ? <Form.Text className="text-muted p-3">
                        Please connect to Metamask before submitting.
                        </Form.Text> : '' }
                    </div>
                
                    </Form>
            </Container> : 
            <Container>
                <Loading/>
            </Container>
        }
    </div>
)
}

export default CreateProfileForm
