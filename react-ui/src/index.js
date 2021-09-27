import React from 'react';
import ReactDOM from 'react-dom';
import './assets/css/index.css';
import App from './components/App';
import 'bootstrap/dist/css/bootstrap.min.css';
import reportWebVitals from './reportWebVitals';
import { Provider } from "react-redux";
import reduxStore from './redux/store.js';
import { CookiesProvider, useCookies } from 'react-cookie';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.render(
  <Provider store = { reduxStore() }>
    <CookiesProvider>
      {/*<React.StrictMode>*/}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      {/*</React.StrictMode>*/}
        </CookiesProvider>
  </Provider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
