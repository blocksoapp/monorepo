import React, { useState } from 'react'
import { Container } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'
import LeftTabs from '../components/ui/LeftTabs'
import Followers from './Followers'
import Following from './Following'

function Follow() {

    const {state} = useLocation();
    const { activeLeftTab } = state; // Read values passed on state


  return (
    <Container>
        <LeftTabs
        firstTab={<Followers/>}
        secondTab={<Following/>}
        activeTab={activeLeftTab}
        />
    </Container>
  )
}

export default Follow

