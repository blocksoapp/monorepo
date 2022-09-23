import React, { useState } from 'react'
import { featuredListData } from '../../data/data'
import ListItem from './ListItem'
import { Row } from 'react-bootstrap'

function FeaturedList() {
    const [featuredList, setList] = useState(featuredListData)
  return (
    <div className='border p-5 text-center'>
        <Row>
            {featuredList.map((address, index) => {
            return <div className="col-sm-6"> 
                        <ListItem
                        list = {featuredList}
                        address={address}
                        key={index}
                        /> 
                        </div>
                    })}
        </Row>
  </div>
  )
}

export default FeaturedList