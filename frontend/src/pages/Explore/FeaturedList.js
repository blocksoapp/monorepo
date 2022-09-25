import React, { useState, useEffect } from 'react'
import { featuredListData } from '../../data/data'
import ListItem from './ListItem'
import { Row, Button } from 'react-bootstrap'
import { baseAPI } from '../../utils'

function FeaturedList() {
    const [profileData, setProfileData] = useState([])
    const [pfpUrl, setPfpUrl] = useState('')
    const featuredList = featuredListData;

  // UseEffect Calling getFeaturedProfiles then map out each item
    useEffect(() => {
        getFeaturedProfiles()
    }, [])
    

    // Function to get profile data for each in array
    const getFeaturedProfiles = async () => {

        var tempProfileArray = []

        const getProfileData = async (addressIndex) => {
            const url = `${baseAPI}/${addressIndex}/profile`
            const res = await fetch(url)
            const data = await res.json()
            return data
        }
        // Storing extracted data into a temp array
        const storeProfileData = async _ => {
            console.log('storing featured profiles')
            for(let index = 0; index < featuredList.length; index++) {
                var currentAddress = featuredList[index]
                var pfpAddressToAdd = await getProfileData(currentAddress)
                tempProfileArray.push(pfpAddressToAdd)
            }

            console.log(tempProfileArray)
            // Set Array State
            setProfileData(tempProfileArray)
        }

        storeProfileData()
    }

    // Function to extract all image url to PFPUrl state
    

  return (
    <div className='p-5'>
        <h1 className='fw-bold'>Featured</h1>
        <Row>
            {
             profileData.map( (item, index) => {
                return (<div className="col-sm-6">
                            <ListItem
                            userAddress={item.address}
                            imageUrl={item.image}
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