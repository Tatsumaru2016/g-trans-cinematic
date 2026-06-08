/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import App from './App';
import AdminDashboard from './admin/AdminDashboard';
import { CinematicConfigProvider } from './context/CinematicConfigContext';
import { LocaleProvider } from './context/LocaleContext';

function getView(): 'cinematic' | 'admin' {
  return window.location.hash.startsWith('#/admin') ? 'admin' : 'cinematic';
}

export default function Root() {
  const [view, setView] = useState(getView);

  useEffect(() => {
    const onHash = () => setView(getView());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const isAdmin = view === 'admin';
    document.documentElement.classList.toggle('admin-view', isAdmin);
    document.body.classList.toggle('admin-view', isAdmin);
    return () => {
      document.documentElement.classList.remove('admin-view');
      document.body.classList.remove('admin-view');
    };
  }, [view]);

  return (
    <LocaleProvider>
      <CinematicConfigProvider>
        {view === 'admin' ? <AdminDashboard /> : <App />}
      </CinematicConfigProvider>
    </LocaleProvider>
  );
}
