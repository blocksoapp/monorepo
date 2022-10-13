import { useEffect, useState } from "react";
import { Card, Image } from "react-bootstrap";
import { useEnsAvatar, useEnsName } from "wagmi";
import { abbrAddress } from "../utils";


function Pfp(props) {

    // constants

    // state

    // functions

    // effects

    // render
    return (
        <div>
        {/* Show placeholder if img url is empty */}
        {props.imgUrl === null ||
         props.imgUrl === undefined ||
         props.imgUrl === ""
            ?   <Card
                    style={{
                        height: props.height,
                        width: props.width,
                        backgroundColor: "#27263d",
                        color: "white",
                        fontSize: props.fontSize

                    }}
                    className="rounded-circle text-center justify-content-center"
                >
                        {props.ensName
                            ? <Card.Text>{props.ensName}</Card.Text>
                            : <Card.Text>{abbrAddress(props.address)}</Card.Text>
                        }
                </Card>
            :   <Image
                    src={props.imgUrl}
                    height={props.height}
                    width={props.width}
                    roundedCircle
                />
        }
        </div>
    )

}


export default Pfp;
