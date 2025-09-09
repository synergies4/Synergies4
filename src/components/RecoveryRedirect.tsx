'use client';

import { useEffect } from 'react';

export default function RecoveryRedirect() {
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const hasCode = url.searchParams.has('code');
      const hasError = url.searchParams.has('error') || url.searchParams.has('error_code');
      const isRecovery = url.searchParams.get('type') === 'recovery' || url.searchParams.has('token_hash');

      if ((hasCode || hasError || isRecovery) && url.pathname !== '/reset-password') {
        url.pathname = '/reset-password';
        window.location.replace(url.toString());
      }
    } catch {}
  }, []);

  return null;
}


