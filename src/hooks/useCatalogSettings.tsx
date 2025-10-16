import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CatalogSettings {
  cart_position: 'on_card' | 'below_card';
  favorite_icon_style: 'outline' | 'filled';
  favorite_position: 'top_right' | 'top_left' | 'bottom_right' | 'bottom_left';
  card_spacing: 'tight' | 'normal' | 'loose';
  card_vertical_spacing: 'tight' | 'normal' | 'loose';
  cards_per_row_desktop: number;
  cards_per_row_tablet: number;
  cards_per_row_mobile: number;
  card_rounding: 'none' | 'small' | 'medium' | 'large' | 'full';
  full_width_layout: boolean;
  show_hover_effects: boolean;
}

const defaultSettings: CatalogSettings = {
  cart_position: 'below_card',
  favorite_icon_style: 'outline',
  favorite_position: 'top_right',
  card_spacing: 'normal',
  card_vertical_spacing: 'normal',
  cards_per_row_desktop: 3,
  cards_per_row_tablet: 2,
  cards_per_row_mobile: 1,
  card_rounding: 'medium',
  full_width_layout: false,
  show_hover_effects: true,
};

export const useCatalogSettings = () => {
  const [settings, setSettings] = useState<CatalogSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('catalog_display_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSettings(data as CatalogSettings);
      }
    } catch (error) {
      console.error('Error loading catalog settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGridClasses = () => {
    const horizontalSpacing = {
      tight: 'gap-x-0',
      normal: 'gap-x-6',
      loose: 'gap-x-8',
    };

    const verticalSpacing = {
      tight: 'gap-y-0',
      normal: 'gap-y-6',
      loose: 'gap-y-8',
    };

    const cols = {
      desktop: {
        2: 'lg:grid-cols-2',
        3: 'lg:grid-cols-3',
        4: 'lg:grid-cols-4',
        5: 'lg:grid-cols-5',
      },
      tablet: {
        1: 'md:grid-cols-1',
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-3',
      },
    };

    return `grid grid-cols-1 ${cols.tablet[settings.cards_per_row_tablet as keyof typeof cols.tablet]} ${cols.desktop[settings.cards_per_row_desktop as keyof typeof cols.desktop]} ${horizontalSpacing[settings.card_spacing]} ${verticalSpacing[settings.card_vertical_spacing]}`;
  };

  const getRoundingClass = () => {
    const rounding = {
      none: 'rounded-none',
      small: 'rounded-sm',
      medium: 'rounded-md',
      large: 'rounded-lg',
      full: 'rounded-2xl',
    };
    return rounding[settings.card_rounding];
  };

  const getContainerClass = () => {
    return settings.full_width_layout ? 'w-full' : 'container mx-auto px-4';
  };

  return {
    settings,
    loading,
    getGridClasses,
    getRoundingClass,
    getContainerClass,
  };
};