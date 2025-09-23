import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface SEOData {
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  canonical_url?: string;
  robots?: string;
  schema_markup?: any;
  font_headings?: string;
  font_body?: string;
  font_accent?: string;
  font_weights?: {
    headings: string[];
    body: string[];
    accent: string[];
  };
  custom_fonts_css?: string;
}

const pageNameMap: { [key: string]: string } = {
  '/': 'home',
  '/catalog': 'catalog',
  '/about': 'about',
  '/contacts': 'contacts',
  '/privacy': 'privacy',
  '/terms': 'terms',
  '/lookbook': 'lookbook',
  '/cart': 'cart',
  '/favorites': 'favorites',
};

const SEOHead = () => {
  const location = useLocation();
  const [seoData, setSeoData] = useState<SEOData | null>(null);
  const [siteSettings, setSiteSettings] = useState<any>(null);

  useEffect(() => {
    loadSEOData();
    loadSiteSettings();
  }, [location.pathname]);

  const loadSEOData = async () => {
    try {
      const pageName = pageNameMap[location.pathname] || 'home';
      
      const { data, error } = await supabase
        .from('seo_settings')
        .select('*')
        .eq('page_name', pageName)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading SEO data:', error);
        return;
      }
      
      if (data) {
        // Process font_weights JSON data
        const processedData = {
          ...data,
          font_weights: typeof data.font_weights === 'object' && data.font_weights !== null 
            ? data.font_weights as { headings: string[]; body: string[]; accent: string[]; }
            : { headings: ['400', '600'], body: ['400'], accent: ['400'] }
        };
        setSeoData(processedData);
      }
    } catch (error) {
      console.error('Error loading SEO data:', error);
    }
  };

  const loadSiteSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .maybeSingle();
      
      if (!error && data) {
        setSiteSettings(data);
      }
    } catch (error) {
      console.error('Error loading site settings:', error);
    }
  };

  // Generate Google Fonts URL
  const generateGoogleFontsUrl = () => {
    if (!seoData) return '';
    
    const fonts = new Set<string>();
    
    if (seoData.font_headings && seoData.font_headings !== 'Inter') {
      const weights = seoData.font_weights?.headings || ['400', '600'];
      fonts.add(`${seoData.font_headings.replace(/\s+/g, '+')}:wght@${weights.join(';')}`);
    }
    
    if (seoData.font_body && seoData.font_body !== 'Inter' && seoData.font_body !== seoData.font_headings) {
      const weights = seoData.font_weights?.body || ['400'];
      fonts.add(`${seoData.font_body.replace(/\s+/g, '+')}:wght@${weights.join(';')}`);
    }
    
    if (seoData.font_accent && seoData.font_accent !== 'Inter' && 
        seoData.font_accent !== seoData.font_headings && 
        seoData.font_accent !== seoData.font_body) {
      const weights = seoData.font_weights?.accent || ['400'];
      fonts.add(`${seoData.font_accent.replace(/\s+/g, '+')}:wght@${weights.join(';')}`);
    }

    if (fonts.size === 0) return '';
    
    return `https://fonts.googleapis.com/css2?${Array.from(fonts).map(f => `family=${f}`).join('&')}&display=swap`;
  };

  useEffect(() => {
    if (!seoData) return;

    // Update meta tags
    document.title = seoData.meta_title || 'Премиальная одежда';
    
    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', seoData.meta_description || '');

    // Update or create meta keywords
    if (seoData.meta_keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', seoData.meta_keywords);
    }

    // Update or create Open Graph tags
    const ogTags = [
      { property: 'og:title', content: seoData.og_title || seoData.meta_title },
      { property: 'og:description', content: seoData.og_description || seoData.meta_description },
      { property: 'og:image', content: seoData.og_image },
    ];

    ogTags.forEach(tag => {
      if (tag.content) {
        let ogTag = document.querySelector(`meta[property="${tag.property}"]`);
        if (!ogTag) {
          ogTag = document.createElement('meta');
          ogTag.setAttribute('property', tag.property);
          document.head.appendChild(ogTag);
        }
        ogTag.setAttribute('content', tag.content);
      }
    });

    // Update or create robots meta tag
    if (seoData.robots) {
      let robotsTag = document.querySelector('meta[name="robots"]');
      if (!robotsTag) {
        robotsTag = document.createElement('meta');
        robotsTag.setAttribute('name', 'robots');
        document.head.appendChild(robotsTag);
      }
      robotsTag.setAttribute('content', seoData.robots);
    }

    // Update or create canonical link
    if (seoData.canonical_url) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', seoData.canonical_url);
    }

    // Update or create schema markup
    if (seoData.schema_markup && typeof seoData.schema_markup === 'object') {
      let schemaScript = document.querySelector('#schema-markup');
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'schema-markup';
        (schemaScript as HTMLScriptElement).type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(seoData.schema_markup);
    }

    // Apply fonts
    const fontsUrl = generateGoogleFontsUrl();
    if (fontsUrl) {
      const existingLink = document.getElementById('seo-google-fonts');
      if (existingLink) existingLink.remove();
      
      const link = document.createElement('link');
      link.id = 'seo-google-fonts';
      link.href = fontsUrl;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    // Apply custom fonts CSS
    if (seoData.custom_fonts_css) {
      const existingStyle = document.getElementById('seo-custom-fonts');
      if (existingStyle) existingStyle.remove();
      
      const style = document.createElement('style');
      style.id = 'seo-custom-fonts';
      style.textContent = seoData.custom_fonts_css;
      document.head.appendChild(style);
    }

    // Apply font families to CSS variables
    if (seoData.font_headings || seoData.font_body || seoData.font_accent) {
      const existingFontVars = document.getElementById('seo-font-variables');
      if (existingFontVars) existingFontVars.remove();
      
      const style = document.createElement('style');
      style.id = 'seo-font-variables';
      
      let css = ':root {';
      if (seoData.font_headings) {
        css += `--font-headings: "${seoData.font_headings}", sans-serif;`;
      }
      if (seoData.font_body) {
        css += `--font-body: "${seoData.font_body}", sans-serif;`;
      }
      if (seoData.font_accent) {
        css += `--font-accent: "${seoData.font_accent}", sans-serif;`;
      }
      css += '}';
      
      // Apply fonts to common elements
      css += `
        h1, h2, h3, h4, h5, h6 { font-family: var(--font-headings) !important; }
        body, p, span, div { font-family: var(--font-body) !important; }
        .font-accent, .accent { font-family: var(--font-accent) !important; }
      `;
      
      style.textContent = css;
      document.head.appendChild(style);
    }
  }, [seoData]);

  // Update favicon
  useEffect(() => {
    if (siteSettings?.favicon_url) {
      const existingFavicon = document.querySelector('link[rel="icon"]');
      if (existingFavicon) {
        existingFavicon.setAttribute('href', siteSettings.favicon_url);
      } else {
        const newFavicon = document.createElement('link');
        newFavicon.rel = 'icon';
        newFavicon.href = siteSettings.favicon_url;
        document.head.appendChild(newFavicon);
      }
    }
  }, [siteSettings]);

  return null; // This component doesn't render anything
};

export default SEOHead;