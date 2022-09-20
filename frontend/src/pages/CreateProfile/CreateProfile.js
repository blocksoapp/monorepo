import React, {useState} from 'react'
import CreateProfileForm from './CreateProfileForm'


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
   
        return (
            <>
                <CreateProfileForm
                profile={profile}
                setProfile={setProfile}
                initialState={initialState}/>
            </>
        )
}

export default CreateProfile
