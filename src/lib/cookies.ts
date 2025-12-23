'use client';

import Cookies from 'js-cookie';

const CONSENT_COOKIE = 'cuidja_cookie_consent';

export const getCookieConsent = (): boolean | undefined => {
  const consent = Cookies.get(CONSENT_COOKIE);
  if (consent === 'true') {
    return true;
  }
  if (consent === 'false') {
    return false;
  }
  return undefined;
};

export const setCookieConsent = (hasConsented: boolean) => {
  Cookies.set(CONSENT_COOKIE, String(hasConsented), { expires: 365 });
};
