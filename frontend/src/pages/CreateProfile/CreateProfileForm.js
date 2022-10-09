import React, { useEffect, useState } from 'react'
import { Container, Form, Button, Row, Col } from 'react-bootstrap'
import { baseAPI, getCookie } from '../../utils'
import NftForm from './NftForm'
import { useAccount } from 'wagmi'
import FileUpload from './FileUpload'
import CurrentPfp from './CurrentPfp'
import Loading from '../../components/ui/Loading'
import FormSocialLinks from './FormSocialLinks'

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
            <Container className='border p-3'>
                <Form>
                
                <div className='d-flex'>
                    <div className='d-flex flex-column'>
                        <Form.Label className="fw-bold">Profile Picture</Form.Label>
                        <Form.Text className="text-muted">
                        Upload a picture for your profile so everyone can tell who you are!
                        </Form.Text>
                    </div>
                    <div className='d-flex flex-column flex-grow'>

                        <CurrentPfp
                        pfp={pfp}
                        userAddress={userAddress}/>

                        <FileUpload
                        profile={profile}
                        setProfile={setProfile}/>

                        <NftForm
                        profile={profile}
                        setProfile={setProfile}/>
                    </div>
                </div>
            


                <Form.Group className="mb-3 border p-3">
                    <Form.Label className='fw-bold'>Your Bio</Form.Label>
                    <Form.Control onChange={handleChange} name="bio" as="textarea" rows={3} value={profile.bio} type="text" placeholder="" />
                    <Form.Text className="text-muted">
                    Tell us a little about yourself.
                    </Form.Text>
                </Form.Group>

                <FormSocialLinks
                handleChange={handleChange}
                profile={profile}
                />

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
            <Container><Loading/></Container>
        }
    </div>
)
}

export default CreateProfileForm
