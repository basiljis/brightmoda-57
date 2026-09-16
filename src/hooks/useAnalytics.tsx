import { useEffect, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Generate session ID that persists during browser session
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

type Geo = { city: string | null; region: string | null; country: string | null };
const EMPTY_GEO: Geo = { city: null, region: null, country: null };

/* ---------- Geolocation status (shared across the app) ---------- */
let geoUnavailable = false;
const geoListeners = new Set<(value: boolean) => void>();

const setGeoUnavailable = (value: boolean) => {
  if (geoUnavailable === value) return;
  geoUnavailable = value;
  geoListeners.forEach((listener) => listener(value));
};

export const useGeoStatus = () => {
  const [unavailable, setUnavailable] = useState(geoUnavailable);
  useEffect(() => {
    geoListeners.add(setUnavailable);
    setUnavailable(geoUnavailable);
    return () => {
      geoListeners.delete(setUnavailable);
    };
  }, []);
  return unavailable;
};

/* ---------- Geolocation with caching (avoids rate limit 429) ---------- */
let geoPromise: Promise<Geo> | null = null;

const getGeolocation = async (): Promise<Geo> => {
  const cached = sessionStorage.getItem('analytics_geo');
  if (cached) {
    try {
      return JSON.parse(cached) as Geo;
    } catch {
      /* ignore malformed cache */
    }
  }

  if (!geoPromise) {
    geoPromise = (async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) {
          // 429 = too many requests, region detection temporarily unavailable
          setGeoUnavailable(true);
          return EMPTY_GEO;
        }
        const data = await response.json();
        if (data?.error) {
          setGeoUnavailable(true);
          return EMPTY_GEO;
        }
        const geo: Geo = {
          city: data.city || null,
          region: data.region || null,
          country: data.country_name || null,
        };
        sessionStorage.setItem('analytics_geo', JSON.stringify(geo));
        setGeoUnavailable(false);
        return geo;
      } catch {
        setGeoUnavailable(true);
        return EMPTY_GEO;
      } finally {
        // allow a later retry in the same session
        setTimeout(() => {
          geoPromise = null;
        }, 60_000);
      }
    })();
  }

  return geoPromise;
};

/* ---------- Tracking enabled flag ---------- */
let trackingEnabledPromise: Promise<boolean> | null = null;

const isTrackingEnabled = async (): Promise<boolean> => {
  if (!trackingEnabledPromise) {
    trackingEnabledPromise = (async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('analytics_tracking_enabled')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        return (data as any)?.analytics_tracking_enabled ?? true;
      } catch {
        return true;
      }
    })();
  }
  return trackingEnabledPromise;
};

/* ---------- Page view de-duplication ---------- */
const trackedPaths = new Set<string>();

export const useAnalytics = () => {
  const location = useLocation();
  const { user } = useAuth();
  const sessionId = getSessionId();

  // Track page view
  const trackPageView = useCallback(async (pagePath?: string, pageTitle?: string) => {
    try {
      if (!(await isTrackingEnabled())) return;

      const path = pagePath || location.pathname;
      const title = pageTitle || document.title;

      // The hook is used in several components at once — record each page once
      if (trackedPaths.has(path)) return;
      trackedPaths.add(path);

      const geo = await getGeolocation();

      await supabase.from('page_views').insert({
        user_id: user?.id || null,
        page_path: path,
        page_title: title,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        session_id: sessionId,
        city: geo.city,
        region: geo.region,
        country: geo.country
      });
    } catch (error) {
      // never block the page because of analytics
    }
  }, [location.pathname, user?.id, sessionId]);

  // Track user action
  const trackAction = useCallback(async (
    actionType: string, 
    entityType?: string, 
    entityId?: string, 
    metadata?: Record<string, any>
  ) => {
    try {
      if (!(await isTrackingEnabled())) return;

      await supabase.from('user_actions').insert({
        user_id: user?.id || null,
        action_type: actionType,
        entity_type: entityType || null,
        entity_id: entityId || null,
        metadata: metadata || {},
        session_id: sessionId
      });
    } catch (error) {
      // never block the UI because of analytics
    }
  }, [user?.id, sessionId]);

  // Track page views automatically
  useEffect(() => {
    trackPageView();
  }, [trackPageView]);

  // Specific tracking functions
  const trackProductView = useCallback((productId: string, productName?: string) => {
    trackAction('product_view', 'product', productId, { product_name: productName });
  }, [trackAction]);

  const trackAddToCart = useCallback((productId: string, quantity: number = 1, price?: number) => {
    trackAction('add_to_cart', 'product', productId, { quantity, price });
  }, [trackAction]);

  const trackRemoveFromCart = useCallback((productId: string, quantity: number = 1) => {
    trackAction('remove_from_cart', 'product', productId, { quantity });
  }, [trackAction]);

  const trackAddToFavorites = useCallback((productId: string, productName?: string) => {
    trackAction('add_to_favorites', 'product', productId, { product_name: productName });
  }, [trackAction]);

  const trackRemoveFromFavorites = useCallback((productId: string) => {
    trackAction('remove_from_favorites', 'product', productId);
  }, [trackAction]);

  const trackCheckoutStarted = useCallback((cartValue: number, itemCount: number) => {
    trackAction('checkout_started', 'cart', undefined, { cart_value: cartValue, item_count: itemCount });
  }, [trackAction]);

  const trackCheckoutCompleted = useCallback((orderId: string, orderValue: number, itemCount: number) => {
    trackAction('checkout_completed', 'order', orderId, { order_value: orderValue, item_count: itemCount });
  }, [trackAction]);

  const trackSearch = useCallback((searchTerm: string, resultsCount?: number) => {
    trackAction('search', 'search', undefined, { search_term: searchTerm, results_count: resultsCount });
  }, [trackAction]);

  const trackEmailSubscription = useCallback((email: string) => {
    trackAction('email_subscription', 'subscription', undefined, { email });
  }, [trackAction]);

  return {
    trackPageView,
    trackAction,
    trackProductView,
    trackAddToCart,
    trackRemoveFromCart,
    trackAddToFavorites,
    trackRemoveFromFavorites,
    trackCheckoutStarted,
    trackCheckoutCompleted,
    trackSearch,
    trackEmailSubscription
  };
};
