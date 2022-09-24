import React, { useState } from 'react'
import { featuredListData } from '../../data/data'
import ListItem from './ListItem'
import { Row, Button } from 'react-bootstrap'
import { baseAPI } from '../../utils'

function FeaturedList() {
    const [featuredList, setList] = useState(featuredListData)
    const [pfpArray, setPfpArray] = useState([])
    const [pfpUrl, setPfpUrl] = useState('')

  // UseEffect Calling getFeaturedProfiles then map out each item

    // Function to get profile data for each in array
    const getFeaturedProfiles = async () => {

        var tempPfpArray = []

        const getProfileData = async (addressIndex) => {
            const url = `${baseAPI}/${addressIndex}/profile`
            const res = await fetch(url)
            const data = await res.json()
            return data
        }

        const storeProfileData = async _ => {
            console.log('start')
            for(let index = 0; index < featuredList.length; index++) {
                var currentAddress = featuredList[index]
                var pfpAddressToAdd = await getProfileData(currentAddress)
                tempPfpArray.push(pfpAddressToAdd)
                console.log('pushed to array')
            }

            console.log(tempPfpArray)
            setPfpArray(tempPfpArray)
        }


        storeProfileData()
    }

    // Function to extract all image url to PFPUrl state

    

    // Function to return mapped items

  return (
    <div className='p-5'>
        <h1 className='fw-bold'>Featured</h1>
        <Button onClick={getFeaturedProfiles}>Get Profiles</Button>
        <Row>
            {featuredList.map((item, index) => {
            return <div className="col-sm-6"> 
                        <ListItem
                        list = {featuredList}
                        userAddress={item}
                        key={index}
                        /> 
                        </div>
                    })}
        </Row>
  </div>
  )
}

export default FeaturedList