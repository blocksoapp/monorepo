import React, { useState, useEffect } from 'react'
import { Container } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'
import LeftTabs from '../components/ui/LeftTabs'
import Followers from '../components/follow/Followers'
import Following from '../components/follow/Following'

function Follow() {

    const location = useLocation();
    const activeLeftTab = location.state?.activeLeftTab   

  return (
    <Container className='pb-5'>
        <LeftTabs
        firstTab={<Followers/>}
        secondTab={<Following/>}
        activeTab={activeLeftTab ? activeLeftTab : 'first'}
        />
    </Container>
  )
}

export default Follow

