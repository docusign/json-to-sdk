// Copyright DocuSign, Inc. Ⓒ 2020. MIT License -- https://opensource.org/licenses/MIT
import React from 'react';

import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import NavbarSection from './components/NavbarSection';
import BodySection from './components/BodySection';

import './App.css';

const App = () => (
    <>
        <NavbarSection />
        <Container fluid>
            <Row>
                <BodySection />
            </Row>
        </Container>
    </>
);

export default App;
