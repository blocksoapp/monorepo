import React, {useState} from 'react'
import { Container } from 'react-bootstrap'
import { baseAPI } from '../utils'
import EditProfileForm from '../components/profile/EditProfile/EditProfileForm'


function EditProfile() {
    const [profile, setProfile] = useState({
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


    // Fetch user profile status
    const getUser = async () => {
        const url = `${baseAPI}/user/`
        const res = await fetch(url, {
          method: 'GET',
          credentials: 'include'
        })
        console.log('fetched profile:', res)
        const data = res.json()
        return data
      }

      
   
        return (
            <div className='p-sm-4'>
                <Container>
                    <h2 className='fw-bold mb-5'>Edit Your Blockso Profile</h2>
                    <EditProfileForm
                    profile={profile}
                    setProfile={setProfile}
                    getUser={getUser}/>
                </Container>
            </div>
        )
}

export default EditProfile
