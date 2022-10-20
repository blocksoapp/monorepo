import React, { useState, useEffect } from 'react'
import { useLocation, useParams } from "react-router-dom";
import { Container } from 'react-bootstrap'
import { useEnsAddress, useEnsName } from 'wagmi'
import { utils as ethersUtils } from 'ethers';
import Profile from "./Profile";
import ProfileInvalid from "./ProfileInvalid";


function ProfileResolver() {
    // constants
    const { urlInput } = useParams();
    const routerLocation = useLocation();
    const ensAddressHook = useEnsAddress({name: urlInput});
    const ensNameHook = useEnsName({address: urlInput});

    // state
    const [address, setAddress] = useState(null);
    const [ensName, setEnsName] = useState(null);
    const [profileInvalid, setProfileInvalid] = useState(false);
 

    /*
     * Resolve the given address from the url when the profile is navigated to.
     */
    useEffect(() => {
        // reset the state
        setProfileInvalid(false);
        setAddress(null);
        setEnsName(null);

        // set profile as invalid if url input is null or undefined
        if (!urlInput) {
            setProfileInvalid(true);
            return;
        }

        // validate non-ens address
        if (!urlInput.endsWith(".eth")) {
            try {
                ethersUtils.getAddress(urlInput);
                setAddress(urlInput);
            }
            catch (error) {
                console.error(error);
                setProfileInvalid(true);
                return;
            }
        }
    }, [urlInput])


    /*
     * Set the ens reverse-lookup address if it exists.
     * Set profile to be invalid if ens name does not resolve to address.
     */
    useEffect(() => {
        if (ensAddressHook.isLoading) {
            return;
        }

        if (ensAddressHook.data !== null) {
            setAddress(ensAddressHook.data);
        }
        else {
            if (urlInput.endsWith(".eth")) {
                setProfileInvalid(true);
            }
        }
    }, [ensAddressHook, urlInput])


    /*
     * Set the ENS Name if it exists.
     */
    useEffect(() => {
        if (!ensNameHook.isLoading && ensNameHook.data !== null) {
            setEnsName(ensNameHook.data);
        }
    }, [ensNameHook, urlInput])


    return (
        <>
            {profileInvalid === true
                ? <ProfileInvalid address={urlInput} /> 
                : <Profile address={address} ensName={ensName} />
            }
        </>
    )
}

export default ProfileResolver;
