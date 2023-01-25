import { useEffect, useState } from "react";
import TxAddress from "../TxAddress";


function MentionsOutput({text}) {

    // constants
    const addrRegex = /\(0x\w{40}\)|(everyone)/gmi;

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
        const regexp = /(@\[@[\w\.]*\]\(0x\w{40}\)|@\[@everyone\]\(everyone\))/gmi;
        var tempText = text.split(regexp);
        setParts(tempText);
    }, []);


    return (
        <>
            {parts && 
             parts.map((part, index) => {
                 var match = part.match(addrRegex);
                 if (match) {
                     if (match[0].toLowerCase() === "everyone") {
                         return <span key={index}>@{match[0]}</span>
                     }
                     else {
                         return <TxAddress key={index} address={match[0].substr(1,42)} />
                     }
                 }
                 else {
                     return <span key={index}>{part}</span>;
                 }
             })}
        </>
    )
}


export default MentionsOutput;
