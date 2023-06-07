import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Container } from "react-bootstrap";
import { useEnsAddress, useEnsName, usePublicClient } from "wagmi";
import { getAddress } from "viem";
import { zeroAddress } from "../../../utils";
import ContractProfile from "./ContractProfile";
import Profile from "./Profile";
import ProfileInvalid from "./ProfileInvalid";
import MainHeader from "../../ui/MainHeader";

function ProfileResolver() {
  // constants
  const { urlInput } = useParams();
  const ensAddressHook = useEnsAddress(
      urlInput.endsWith(".eth") ? {name: urlInput} : {} 
  );
  const ensNameHook = useEnsName(
      urlInput.endsWith(".eth") ? {} : {address: urlInput}
  );
  const publicClient = usePublicClient();

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
    const code = await publicClient.getBytecode({address});
    return (code === undefined && address !== zeroAddress)
      ? setIsEOA(true)
      : setIsEOA(false);
  };

  /*
   * Resolve the given address from the url when the profile is navigated to.
   */
  useEffect(() => {
    // set profile as invalid if url input is null or undefined
    if (!urlInput) {
      setProfileInvalid(true);
      return;
    }

    // validate non-ens address
    if (!urlInput.endsWith(".eth")) {
      try {
        const address = getAddress(urlInput);
        setAddress(address);

        // determine whether address is
        // an EOA or a Contract
        determineContractOrEOA(address);
      } catch (error) {
        console.error(error);
        setProfileInvalid(true);
        return;
      }
    }

    // reset state on component unmount
    return () => {
        setProfileInvalid(false);
        setIsEOA(true);
        setAddress(null);
        setEnsName(null);
    }
  }, [urlInput]);

  /*
   * Set the ens reverse-lookup address if it exists.
   * Set profile to be invalid if ens name does not resolve to address.
   */
  useEffect(() => {
    if (ensAddressHook.data) {
      setAddress(ensAddressHook.data);
    } else {
      if (urlInput.endsWith(".eth")) {
        setProfileInvalid(true);
      }
    }
  }, [urlInput, ensAddressHook?.data]);

  /*
   * Set the ENS Name if it exists.
   */
  useEffect(() => {
    if (!ensNameHook.isLoading && ensNameHook.data) {
      setEnsName(ensNameHook.data);
    }
  }, [urlInput, ensNameHook]);

  return (
    <>
      <MainHeader header="Profile" />
      {profileInvalid === true ? (
        <ProfileInvalid address={urlInput} />
      ) : isEOA === true ? (
        <Profile address={address} ensName={ensName} />
      ) : (
        <ContractProfile address={address} ensName={ensName} />
      )}
    </>
  );
}

export default ProfileResolver;
