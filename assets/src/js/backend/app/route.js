import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import Error404 from './error';
import Home from './home';

import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import Sidebar from './sidebar';
// import Referrals from './referrals';

const Tools = () => {
  const [settings, setSettings] = useState({loggedin: true});
  const [secretKey, setSecretKey] = useState(partnershipmangConfig.ajax_nonce);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        chrome.runtime.sendMessage({type: 'popup/settings', data: {}}, (res) => {
          console.log(res);
          if (!res || res?.error || !res?.data) {
            return;
          }
          setSettings(res.data);
        });
      } catch (error) {
        console.error('Error fetching secret key:', error);
      }
    };

    fetchSettings();
  
  }, []);

  const ErrorFallback = ({ error }) => {
    return (
      <div>
        <h2>Something went wrong.</h2>
        <pre style={{ whiteSpace: 'normal' }}>{error.message}</pre>
      </div>
    );
  };


  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <React.StrictMode>
        <Router>
          <div className="xpo_max-w-full xpo_h-screen xpo_select-none xpo_relative" style={{ width: '1000px' }}>
            <div className="xpo_flex xpo_flex-col md:xpo_flex-row">
              <div className="xpo_w-full md:xpo_w-1/5 xpo_relative" style={{ height: '100%' }}>
                <Sidebar />
              </div>
              <div className="xpo_w-full md:xpo_w-4/5 xpo_px-2 xpo_py-4 xpo_overflow-auto xpo_h-screen">
                <Routes>
                  <Route exact path="/" element={<Home settings={settings} />} />
                  {/* <Route path="/referrals" element={<Referrals settings={settings} />} /> */}
                  <Route path="*" element={<Error404 settings={settings} />} />
                </Routes>
              </div>
            </div>
          </div>
        </Router>
      </React.StrictMode>
    </ErrorBoundary>
  );
}

export default Tools;
