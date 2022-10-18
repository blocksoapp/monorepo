import React from 'react'
import { useEnsAvatar } from 'wagmi'

function EnsAvatar(props) {
    const { data, isError, isLoading } = useEnsAvatar({
        addressOrName: props.address
      })
    
      if (isLoading) return <div>Fetching avatar…</div>
      if (isError) return <div>Error fetching avatar</div>
      return <div>Avatar: {data}</div>
}

export default EnsAvatar