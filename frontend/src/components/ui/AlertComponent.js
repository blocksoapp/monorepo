import { useEffect, useState } from "react";
import { Alert, Button } from "react-bootstrap";

function AlertComponent(props) {
    const [show, setShow] = useState(props.show ? props.show : false);

    useEffect(() => {
        return () => {
            setShow(props.show ? props.show : false);
        }
    }, []);

  return (
    <>
      {show && (
        <Alert variant={props.color} onClose={() => setShow(false)} dismissible>
          {props.heading && 
              <Alert.Heading className="d-flex justify-content-between">
                {props.heading}
              </Alert.Heading>
          }
          {props.subheading &&
              <p className="mb-0">{props.subheading}</p>
          }
        </Alert>
      )}
    </>
  );
}

export default AlertComponent;
