import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Wallets from './Wallets';

function ShowWalletOptions() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="primary" onClick={handleShow} className="me-2">
        Connect
      </Button>
      <Offcanvas show={show} onHide={handleClose} placement='end'>
        <Offcanvas.Header closeButton className='border-bottom'>
          <Offcanvas.Title className='fw-bold fs-6'>My Wallet</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className='p-3'>
            <p className='fs-6'>If you don't have a wallet yet, you can select a provider and create one now.</p>
          <Wallets/>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default ShowWalletOptions