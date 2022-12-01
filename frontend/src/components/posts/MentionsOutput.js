import { useEffect, useState } from "react";
import TxAddress from "../TxAddress";


function MentionsOutput({text, bio, numFollowers, numFollowing}) {

    // constants
    const addrRegex = /\(0x\w{40}\)/gmi;

    // state
    const [parts, setParts] = useState(null);

    /*
     * Split the text into parts based on the mentions pattern.
     * mentions pattern: @[__display__](__0xaddress__)
     */
    useEffect(() => {
        // there's a capturing group around the whole regex pattern
        // so that we can split the text into parts based on the regex,
        // while keeping the regex match in there
        const regexp = /(@\[[\w\.]*\]\(0x\w{40}\))/gmi;
        var tempText = text.split(regexp);
        setParts(tempText);
    }, []);


    return (
        <>
            {parts && 
             parts.map((part, index) => {
                 var match = part.match(addrRegex);
                 if (match) {
                     return <TxAddress 
                     key={index} 
                     address={match[0].substr(1,42)}
                     bio={bio}
                     numFollowers={numFollowers}
                     numFollowing={numFollowing} />
                 }
                 else {
                     return <span key={index}>{part}</span>;
                 }
             })}
        </>
    )
}


export default MentionsOutput;