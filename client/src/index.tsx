import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core'
import { StateContextProvider } from './contexts/StateContextProvider';
import { FirebaseContextProvider } from './contexts/FireBaseContextProvider';
import { AuthContextProvider } from './contexts/AuthContextProvider';
import './i18n';

ReactDOM.render(
  <Suspense fallback={<div>Loading ...</div>}>
    <FirebaseContextProvider>
      <StateContextProvider>
        <AuthContextProvider>
          <MantineProvider theme={{ colorScheme: 'dark', fontFamily: "sans-serif", headings: { fontFamily: "sans-serif" } }} >
            <BrowserRouter>
              <React.StrictMode>
                <App />
              </React.StrictMode>
            </BrowserRouter>
          </MantineProvider>
        </AuthContextProvider>
      </StateContextProvider>
    </FirebaseContextProvider>
  </Suspense>
  , document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
