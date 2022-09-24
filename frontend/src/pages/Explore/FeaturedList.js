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
      const updatedPfpArray = async () => {
        await getFeaturedProfiles()
        mapFeaturedList()
      }

      updatedPfpArray()
    }, [])
    

    // Function to get profile data for each in array
    const getFeaturedProfiles = async () => {

        var tempPfpArray = []

        const getProfileData = async (addressIndex) => {
            const url = `${baseAPI}/${addressIndex}/profile`
            const res = await fetch(url)
            const data = await res.json()
            return data
        }
        // Storing extracted data into a temp array
        const storeProfileData = async _ => {
            console.log('fetching featured profiles')
            for(let index = 0; index < featuredList.length; index++) {
                var currentAddress = featuredList[index]
                var pfpAddressToAdd = await getProfileData(currentAddress)
                tempPfpArray.push(pfpAddressToAdd)
            }

            console.log(tempPfpArray)
            // Set Array State
            setProfileData(tempPfpArray)
        }

        storeProfileData()
    }

    // Function to extract all image url to PFPUrl state
    

    // Function to return mapped items
    const mapFeaturedList = async () => {
        console.log('called mapFeaturedList')
        console.log('profiledata state: ', profileData)
        featuredList['address'] && featuredList['image'].map( (index) => {
            return (<div className="col-sm-6">
                        <ListItem
                        userAddress={featuredList.address}
                        imageUrl={featuredList.image}
                        key={index}
                        />
                    </div>
        )})
    }

    const mapFeaturedLists = () => {
        return <div><ListItem/></div>
    }

    /* {featuredList.map((item, index) => {
            return <div className="col-sm-6"> 
                        <ListItem
                        list = {featuredList}
                        userAddress={item}
                        key={index}
                        /> 
                        </div>
                    })}
                    */

  return (
    <div className='p-5'>
        <h1 className='fw-bold'>Featured</h1>
        <Button onClick={getFeaturedProfiles}>Get Profiles</Button>
        <Row>
            {mapFeaturedList}
        </Row>
  </div>
  )
}

export default FeaturedList