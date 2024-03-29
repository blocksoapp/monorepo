import { Card, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { abbrAddress } from "../utils";

function Pfp(props) {
  // hooks
  const navigate = useNavigate();

  // state

  // functions
  function charsToCharCodes(string) {
    var toRet = 0;
    for (var i = 0; i < string.length; i++) {
      toRet += parseInt(string.charCodeAt(i));
    }

    return toRet;
  }

  // effects

  // render
  return (
    <div className={props.className + " pointer"} onClick={() => navigate(`/${props.address}/profile`)}>
      {/* Show grey placeholder image if address is null */}
      {!props.address ? (
        <Card
          style={{
            height: props.height,
            width: props.width,
            backgroundColor: `#c2c2c2`,
            color: "white",
            fontSize: props.fontSize,
          }}
          className="rounded-circle text-center justify-content-center"
        ></Card>
      ) : /* Show address placeholder image if img url is empty */
      !props.imgUrl ? (
        <Card
          style={{
            height: props.height,
            width: props.width,
            backgroundColor: `hsla(${charsToCharCodes(
              props.address.substr(36, 6)
            )} 100% 37% / 0.77)`,
            color: "white",
            fontSize: props.fontSize,
          }}
          className="rounded-circle text-center justify-content-center p-2"
        >
          {props.ensName ? (
            <Card.Text>{props.ensName}</Card.Text>
          ) : (
            <Card.Text>
              {props.address ? abbrAddress(props.address) : ""}
            </Card.Text>
          )}
        </Card>
      ) : (
        /* Show image pfp if img url is not empty */
        <Image
          src={props.imgUrl}
          height={props.height}
          width={props.width}
          roundedCircle
        />
      )}
    </div>
  );
}

export default Pfp;
