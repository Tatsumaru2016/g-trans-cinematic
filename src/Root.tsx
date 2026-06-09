/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import App from './App';
import AdminDashboard from './admin/AdminDashboard';
import { CinematicLoadingScreen } from './components/CinematicLoadingScreen';
import { CinematicConfigProvider } from './context/CinematicConfigContext';
import { LocaleProvider } from './context/LocaleContext';
import { useCinematicBoot } from './hooks/useCinematicBoot';
import { removeBootShell } from './lib/bootShell';

function getView(): 'cinematic' | 'admin' {
  return window.location.hash.startsWith('#/admin') ? 'admin' : 'cinematic';
}

function CinematicExperience() {
  const { ready, progress } = useCinematicBoot();

  return (
    <>
      <div
        className={ready ? 'opacity-100' : 'pointer-events-none invisible opacity-0'}
        aria-hidden={!ready}
      >
        <App />
      </div>
      <AnimatePresence mode="wait">
        {!ready && <CinematicLoadingScreen key="cinematic-boot" progress={progress} />}
      </AnimatePresence>
    </>
  );
}

export default function Root() {
  const [view, setView] = useState(getView);
  const [bootKey, setBootKey] = useState(0);

  useEffect(() => {
    if (view === 'admin') {
      removeBootShell();
    }
  }, [view]);

  useEffect(() => {
    const onHash = () => {
      const nextView = getView();
      setView((prev) => {
        if (prev === 'admin' && nextView === 'cinematic') {
          setBootKey((key) => key + 1);
        }
        return nextView;
      });
    };
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
        {view === 'admin' ? <AdminDashboard /> : <CinematicExperience key={bootKey} />}
      </CinematicConfigProvider>
    </LocaleProvider>
  );
}
