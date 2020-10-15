import React from 'react';
import ReactDOM from 'react-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import {ThemeProvider} from '@material-ui/core/styles';
import {App} from './app';
import theme from './utils/theme';
import * as serviceWorkerRegistration from './utils/service-worker-registration';
import {reportWebVitals} from './utils/analytics';

import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);

// https://cra.link/PWA
serviceWorkerRegistration.unregister();

// https://bit.ly/CRA-vitals
reportWebVitals(console.log /* sendToAnalytics */);
