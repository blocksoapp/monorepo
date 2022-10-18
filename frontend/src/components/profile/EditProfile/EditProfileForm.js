import React, { useEffect, useState } from 'react'
import { Container, Form, Button, Row, Col } from 'react-bootstrap'
import { useAccount } from 'wagmi'
import { baseAPI, getCookie } from '../../../utils'
import NftForm from './NftForm'
import FileUpload from './FileUpload'
import CurrentPfp from './CurrentPfp'
import Loading from '../../ui/Loading'
import FormSocialLinks from './FormSocialLinks'
import FormBio from './FormBio'
import FormHeader from './FormHeader'
import TabsComponent from '../../ui/Tabs'
import FormEns from './FormEns'

function EditProfileForm({ profile, setProfile, getUser }) {

    const { isConnected, address } = useAccount();
    const [pfp, setPfp] = useState(null)
    const [pfpPreview, setPfpPreview] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [formProfile, setFormProfile] = useState({
        image: '',
        bio: '',
        socials: {
            website: '',
            telegram: '',
            discord: '',
            twitter: '',
            opensea: '',
            looksrare: '',
            snapshot: ''
        }
    })
    

     // Form State Update
     const handleChange = (event) => {
      const { name, value } = event.target
      setFormProfile(prevValue => {
          return {
              ...prevValue,
              [name]: value
          }
      })
      console.log(formProfile)
  } 

  
  // Form Submission Function
  const handleSubmit = async () => {
      if(!isConnected) return
      setIsLoading(true)
      const url = `${baseAPI}/${address}/profile/`
      const formRes = await fetch(url, {
          method: 'PUT',
          body: JSON.stringify(formProfile),
          headers: {
              'Content-Type': 'application/json',
              'X-CSRFTOKEN': getCookie('csrftoken')
            },
            credentials: 'include'
      })
      
      if(formRes.status === 200 || 201) {
        console.log('successfully posted data')
        setIsLoading(false)
        checkForProfile()
      } else {
        console.log('error posting data')
        setIsLoading(false)
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
    setFormProfile(profile)
    setPfp(profile.image)
  }, [profile])
  


  return (
    <div className="p-3 border mb-5 mt-3">
        {!isLoading ? 
            <Container>
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
                                    address={address}/>
                                </Col>
                                <Col>
                                    <TabsComponent
                                    firstTitle='Upload Image'
                                    secondTitle='Use NFT'
                                    thirdTitle='Use ENS'
                                    firstPane={ 
                                        <FileUpload 
                                        setProfile={setFormProfile}
                                        /> }
                                    secondPane={ 
                                        <NftForm
                                        setProfile={setFormProfile}
                                        /> }
                                    thirdPane={ 
                                        <FormEns 
                                        address={address}
                                        setProfile={setFormProfile}
                                        /> }
                                    />
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
                        profile={formProfile} />
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


                            <div className='mt-3 mb-3'>
                                <Button disabled={!isConnected} variant="dark" onClick={handleSubmit}>
                                    Submit
                                </Button> 
                                {!isConnected ? <Form.Text className="text-muted p-3">
                                Please connect to Metamask before submitting.
                                </Form.Text> : '' }
                            </div>
                        </Col>
                    </Row>

                
                    </Form>
            </Container> : 
                <Loading/>
        }
    </div>
)
}

export default EditProfileForm
