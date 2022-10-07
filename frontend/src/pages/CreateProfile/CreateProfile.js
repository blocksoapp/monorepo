import React, {useState} from 'react'
import CreateProfileForm from './CreateProfileForm'
import { baseAPI } from '../../utils'


function CreateProfile() {
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

    const initialState = {
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
    }

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
            <div className=''>
                <CreateProfileForm
                profile={profile}
                setProfile={setProfile}
                initialState={initialState}
                getUser={getUser}/>
            </div>
        )
}

export default CreateProfile
