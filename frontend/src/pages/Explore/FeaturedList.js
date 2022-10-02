import React, { useState, useEffect } from 'react'
import ListItem from './ListItem'
import { Row } from 'react-bootstrap'
import { baseAPI } from '../../utils'
import { apiGetExplore } from '../../api'
import ExplorePlaceholder from './ExplorePlaceholder';


function FeaturedList() {
    const [profileData, setProfileData] = useState([])
    const [pfpUrl, setPfpUrl] = useState('')
    const [isLoading, setIsLoading] = useState(Boolean)

    // UseEffect Calling getFeaturedProfiles then map out each item
    useEffect(() => {
        getFeaturedProfiles()
    }, [])
    

    // Function to get profile data for each in array
    const getFeaturedProfiles = async () => {
        setIsLoading(true)
        var res = await apiGetExplore();
        const data = await res.json()
        setProfileData(data);
        setIsLoading(false)
    }


  return (
    <div className='p-5'>
        <Row>
            {isLoading 
            ? <ExplorePlaceholder />
            : profileData.map( (item, index) => {
                return (
                    <div className="col-sm-6">
                        <ListItem
                            userAddress={item.address}
                            imageUrl={item.image}
                            bio={item.bio}
                            numFollowers={item.numFollowers}
                            numFollowing={item.numFollowing}
                            key={index}
                            />
                    </div>
                )})
            }
        </Row>
  </div>
  )
}

export default FeaturedList
