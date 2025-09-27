import { useEffect, useCallback } from 'react';
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

export const useAnalytics = () => {
  const location = useLocation();
  const { user } = useAuth();
  const sessionId = getSessionId();

  // Track page view
  const trackPageView = useCallback(async (pagePath?: string, pageTitle?: string) => {
    try {
      const path = pagePath || location.pathname;
      const title = pageTitle || document.title;
      
      await supabase.from('page_views').insert({
        user_id: user?.id || null,
        page_path: path,
        page_title: title,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        session_id: sessionId
      });
    } catch (error) {
      console.error('Failed to track page view:', error);
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
      await supabase.from('user_actions').insert({
        user_id: user?.id || null,
        action_type: actionType,
        entity_type: entityType || null,
        entity_id: entityId || null,
        metadata: metadata || {},
        session_id: sessionId
      });
    } catch (error) {
      console.error('Failed to track action:', error);
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