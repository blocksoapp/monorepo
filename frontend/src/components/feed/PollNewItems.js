import { useEffect, useState } from "react";
import { Alert, Button, Col, Container, Row } from "react-bootstrap";


function PollNewItems({apiFunction, interval, oldItems, callback}) {

    /*
     * Polls the given apiFunction every interval.
     * Displays an alert if there are new items.
     *
     * Accepts: 
     *  - an interval
     *  - a function to poll against
     *  - a list of items to compare new items to
     *  - a callback function.
     */

    // state
    const [items, setItems] = useState(oldItems);
    const [hasNewItems, setHasNewItems] = useState(false);

    // functions
    
    /*
     * Calls the apiFunction.
     * Sets items to the result of the apiFunction.
     */
    const pollForNewItems = async () => {
        const resp = await apiFunction();
        const data = await resp.json();
        setItems(data["results"]);
    }

    // effects

    /*
     * Compares new items to old items, and
     * sets hasNewItems if the first element
     * of each list do not match.
     */
    useEffect(() => {
        // do nothing if there is nothing to compare
        if (!oldItems) return;
        if (!items) return;

        // compare new items to old items
        if (JSON.stringify(items[0]) !== JSON.stringify(oldItems[0])) {
            setHasNewItems(true);
        }
    }, [items])


    /* Runs on component mount.
     * Calls apiFunction every interval.
     * Cleans up the interval function on
     * component unmount.
     */
    useEffect(() => {
        // poll every interval
        const intervalObj = setInterval(
            () => pollForNewItems(),
            interval
        );

        // clean up inverval on unmount
        return () => {
            clearInterval(intervalObj);
        }
    }, [])


    return (
        hasNewItems
            ?   <Container
                    className="position-fixed"
                    style={{
                        zIndex: 1,
                        marginTop: "-2%",
                        left: "50%",
                        transform: "translate(-50%, 0)"
                    }}
                >
                    <Row className="justify-content-center">
                        <Col xs={8} sm={10} md={8} lg={5} xl={4}>
                            <Alert variant="primary">
                                <Row>
                                    <Col xs={12}>
                                        <span>There are new items in your feed!</span>
                                        <span className="d-grid mt-2 d-sm-block mt-sm-0 float-sm-end">
                                            <Button
                                                size="sm"
                                                variant="outline-primary"
                                                onClick={() => {
                                                    callback();
                                                    setHasNewItems(false);
                                                }}
                                            >
                                                Refresh
                                            </Button>
                                        </span>
                                    </Col>
                                </Row>
                            </Alert>
                        </Col>
                    </Row>
                </Container>
            :   <></>
    )
}


export default PollNewItems;
