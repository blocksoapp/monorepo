import { Alert, Button } from "react-bootstrap";
import React from "react";

function AlertComponent(props) {
  return (
    <>
      {props.isToggle ? (
        <Alert variant={props.color} isOpen={props.isToggle}>
          <Alert.Heading className="d-flex justify-content-between">
            {props.heading}
            <Button variant="light" onClick={() => props.setIsToggle(false)}>
              x
            </Button>
          </Alert.Heading>
          <p>{props.subheading}</p>
        </Alert>
      ) : (
        ""
      )}
    </>
  );
}

export default AlertComponent;
