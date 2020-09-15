// Copyright DocuSign, Inc. Ⓒ 2020. MIT License -- https://opensource.org/licenses/MIT
import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

function NavbarSection(props) {
      
    return (
    <Navbar bg="dark" variant="dark" expand="lg">
        <Navbar.Brand href="">DocuSign JSON to SDK tool</Navbar.Brand>
        <Nav className="ml-5">
            <Nav.Link href="https://github.com/docusign/json-to-sdk/blob/master/README.md" 
                target="_blank">Documentation</Nav.Link>
        </Nav>

    </Navbar>
    )
}

export default NavbarSection;
