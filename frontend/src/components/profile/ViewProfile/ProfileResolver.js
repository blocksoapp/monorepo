import React, { useState, useEffect } from 'react'
import { useLocation, useParams } from "react-router-dom";
import { Container } from 'react-bootstrap'
import { useEnsAddress, useEnsName, useProvider } from 'wagmi'
import { utils as ethersUtils } from 'ethers';
import { zeroAddress } from "../../../utils";
import ContractProfile from "./ContractProfile";
import Profile from "./Profile";
import ProfileInvalid from "./ProfileInvalid";


function ProfileResolver() {
    // constants
    const { urlInput } = useParams();
    const ensAddressHook = useEnsAddress({name: urlInput});
    const ensNameHook = useEnsName({address: urlInput});
    const provider = useProvider();

    // state
    const [address, setAddress] = useState(null);
    const [ensName, setEnsName] = useState(null);
    const [profileInvalid, setProfileInvalid] = useState(false);
    const [isEOA, setIsEOA] = useState(true);
 
    // functions

    /*
     * Determines whether the given address is a
     * contract or an externally owned address.
     */
    const determineContractOrEOA = async (address) => {
        // get address code
        const code = await provider.getCode(address);
        return (code === "0x" && address !== zeroAddress)
            ? setIsEOA(true)
            : setIsEOA(false);
    }

    /*
     * Resolve the given address from the url when the profile is navigated to.
     */
    useEffect(() => {
        // reset the state
        setProfileInvalid(false);
        setIsEOA(true);
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

                // determine whether address is
                // an EOA or a Contract
                determineContractOrEOA(urlInput);
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
                : isEOA === true
                    ? <Profile address={address} ensName={ensName} />
                    : <ContractProfile address={address} ensName={ensName} />
            }
        </>
    )
}

export default ProfileResolver;
