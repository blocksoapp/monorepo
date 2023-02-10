import { Card, Image } from "react-bootstrap";


function FeedPfp({className, fontSize, height, imgUrl, onClick, width}) {

  return (
    <div className={className} onClick={onClick}>

      {/* Show dark color placeholder if feed image is not set */}
      {!imgUrl ? (
        <Card
          style={{
            height: height,
            width: width,
            backgroundColor: "rgb(81, 22, 94)",
            color: "white",
            fontSize: fontSize,
          }}
          className="rounded-circle text-center justify-content-center"
        >
            <Card.Text>. . .</Card.Text>
        </Card>
      ) : (
        /* Show image if img url is set */
        <Image
          src={imgUrl}
          height={height}
          width={width}
          roundedCircle
        />
      )}

    </div>
  );
}

export default FeedPfp;
