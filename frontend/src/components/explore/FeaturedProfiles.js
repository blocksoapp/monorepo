import React, { useState, useEffect } from 'react'
import { Row } from 'react-bootstrap'
import { baseAPI } from '../../utils'
import { apiGetExplore } from '../../api'
import ListItem from './ListItem'
import ExplorePlaceholder from './ExplorePlaceholder';


function FeaturedProfiles({profiles}) {
    const [isLoading, setIsLoading] = useState(Boolean)

    /*
     * Sets isLoading to false when the
     * profiles prop is not empty.
     */
    useEffect(() => {
        profiles
            ? setIsLoading(false)
            : setIsLoading(true)
    }, [profiles])
    

    return (
        <Row>
            {isLoading 
            ? <ExplorePlaceholder />
            : profiles.map( (item, index) => {
                return (
                    <div key={index} className="col-sm-6">
                        <ListItem
                            key={index}
                            userAddress={item.address}
                            imageUrl={item.image}
                            bio={item.bio}
                            numFollowers={item.numFollowers}
                            numFollowing={item.numFollowing}
                        />
                    </div>
                )})
            }
        </Row>
    )
}

export default FeaturedProfiles;
