/*
 * Uses the given address and imgUrl to resolve a pfp.
 * If the given imgUrl is not empty, then it
 * is used for the Pfp componet.
 *
 * If the given imgUrl is empty or null, then
 * the address is used to look up an ENS avatar.
 *
 * If the user doesn't have an ENS avatar, then
 * their ENS name is used for their Pfp.
 *
 * If the user doesn't have an ENS name, then
 * their address is abbreviated and used for Pfp.
 *
 */
import { useEffect, useState } from "react";
import { Card, Image } from "react-bootstrap";
import { useEnsAvatar, useEnsName } from "wagmi";
import Pfp from "./Pfp.js";


function PfpResolver({address, imgUrl, height, width, fontSize}) {

    // constants
    const ensAvatarHook = useEnsAvatar({addressOrName: address});
    const ensNameHook = useEnsName({address: address});

    // state
    const [pfpEnsName, setPfpEnsName] = useState(null);
    const [pfpImgUrl, setPfpImgUrl] = useState(imgUrl);

    // effects

    /*
     * Set the pfp img url to the ens avatar if
     * the user does not have a profile pic.
     */
    useEffect(() => {
        if (!imgUrl && !ensAvatarHook.isLoading && ensAvatarHook.data !== null) {
            setPfpImgUrl(ensAvatarHook.data);
        }
    }, [ensAvatarHook])

    /*
     * Set the pfp ens name if it exists.
     */
    useEffect(() => {
        if (!ensNameHook.isLoading && ensNameHook.data !== null) {
            setPfpEnsName(ensNameHook.data);
        }
    }, [ensNameHook])

    /*
     * Set pfpImgUrl if the imgUrl property is changed.
     */
    useEffect(() => {
        if (!imgUrl) return;
        setPfpImgUrl(imgUrl);
    }, [imgUrl])


    // render
    return (
        <Pfp
            address={address}
            imgUrl={pfpImgUrl}
            ensName={pfpEnsName}
            height={height}
            width={width}
            fontSize={fontSize}
        />
    )

}


export default Pfp;
