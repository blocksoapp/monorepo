/*
 * Hooks (functions) shared across our components.
 */
import { useEffect, useState } from "react";
import { useFetch } from './useFetch'
import { baseAPI } from '../utils'

/*
 * Retrieves pfp from profile.
 * Returns null if no data.
 */
export const usePfp = async (userAddress) => {
    const [data, setData] = useState(null)
    const [profileData, setProfileData] = useState(null)
    const [error, setError] = useState(null)

    const url = `${baseAPI}/user/${userAddress}`;
    const fetchProfile = useFetch(url)
    console.log(fetchProfile)

    useEffect(() => {
        console.log('profile data updated, useeffect called')
    
    }, [profileData])

  
    

}