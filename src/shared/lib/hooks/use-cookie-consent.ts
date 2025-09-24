// src/hooks/useCookieConsent.ts
/**
 * @file useCookieConsent.ts
 * @description Hook para gestionar el estado del consentimiento de cookies.
 * @version 1.0.0
 * @author IA Ingeniera de Software Senior v2.0
 */
"use client";

import { useState, useEffect, useCallback } from "react";

const CONSENT_STORAGE_KEY = "cookie_consent_status";

type ConsentStatus = "pending" | "accepted" | "rejected";

interface CookieConsentState {
  status: ConsentStatus;
  hasBeenSet: boolean;
  accept: () => void;
  reject: () => void;
}

export function useCookieConsent(): CookieConsentState {
  const [status, setStatus] = useState<ConsentStatus>("pending");
  const [hasBeenSet, setHasBeenSet] = useState(true);

  useEffect(() => {
    try {
      const storedStatus = window.localStorage.getItem(
        CONSENT_STORAGE_KEY
      ) as ConsentStatus | null;
      if (storedStatus) {
        setStatus(storedStatus);
        setHasBeenSet(true);
      } else {
        setHasBeenSet(false);
      }
    } catch (error) {
      console.error("Failed to read cookie consent from localStorage", error);
      setHasBeenSet(false);
    }
  }, []);

  const accept = useCallback(() => {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, "accepted");
      setStatus("accepted");
      setHasBeenSet(true);
    } catch (error) {
      console.error("Failed to save cookie consent to localStorage", error);
    }
  }, []);

  const reject = useCallback(() => {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, "rejected");
      setStatus("rejected");
      setHasBeenSet(true);
    } catch (error) {
      console.error("Failed to save cookie consent to localStorage", error);
    }
  }, []);

  return { status, hasBeenSet, accept, reject };
}
// src/hooks/useCookieConsent.ts
