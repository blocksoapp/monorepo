import { useState, useEffect } from 'react'
import { Container } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'
import LeftTabs from '../components/ui/LeftTabs'
import FeedFollowers from '../components/feed/FeedFollowers'
import FeedFollowing from '../components/feed/FeedFollowing'


function FeedFollow() {

    const location = useLocation();
    const activeLeftTab = location.state?.activeLeftTab   

  return (
    <Container className='pb-5'>
        <LeftTabs
            firstTab={<FeedFollowers/>}
            secondTab={<FeedFollowing/>}
            activeTab={activeLeftTab ? activeLeftTab : 'first'}
        />
    </Container>
  )
}

export default FeedFollow
