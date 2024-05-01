import React from 'react';
import ReactDOM from 'react-dom/client';

const App = require('./app.js').default;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App/>
)