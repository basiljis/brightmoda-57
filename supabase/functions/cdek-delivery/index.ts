import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeliveryRequest {
  postal_code: string;
  packages: {
    weight: number;
    length: number;
    width: number;
    height: number;
  }[];
}

interface CDEKTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface CDEKTariffResponse {
  tariff_code: number;
  tariff_name: string;
  tariff_description: string;
  delivery_mode: number;
  delivery_sum: number;
  period_min: number;
  period_max: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get delivery settings from database
    const { data: settings, error: settingsError } = await supabaseClient
      .from('delivery_settings')
      .select('*')
      .single();

    if (settingsError || !settings) {
      console.error('Settings error:', settingsError);
      return new Response(
        JSON.stringify({ error: 'Настройки доставки не найдены' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!settings.cdek_client_id || !settings.cdek_client_secret) {
      return new Response(
        JSON.stringify({ error: 'CDEK API данные не настроены' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { postal_code, packages }: DeliveryRequest = await req.json();

    // Get CDEK access token
    const tokenResponse = await fetch('https://api.edu.cdek.ru/v2/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: settings.cdek_client_id,
        client_secret: settings.cdek_client_secret,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Token response error:', await tokenResponse.text());
      return new Response(
        JSON.stringify({ error: 'Ошибка авторизации CDEK' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const tokenData: CDEKTokenResponse = await tokenResponse.json();
    console.log('CDEK token obtained successfully');

    // Calculate delivery options
    const deliveryResponse = await fetch('https://api.cdek.ru/v2/calculator/tarifflist', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 1,
        currency: 1,
        lang: 'rus',
        from_location: {
          code: settings.default_city_code
        },
        to_location: {
          postal_code: postal_code
        },
        packages: packages
      }),
    });

    if (!deliveryResponse.ok) {
      console.error('Delivery response error:', await deliveryResponse.text());
      return new Response(
        JSON.stringify({ error: 'Ошибка расчета доставки' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const deliveryData: { tariffs: CDEKTariffResponse[] } = await deliveryResponse.json();
    console.log('Delivery options calculated successfully');

    // Format response for frontend
    const formattedTariffs = deliveryData.tariffs.map(tariff => ({
      id: tariff.tariff_code,
      name: tariff.tariff_name,
      description: tariff.tariff_description,
      mode: tariff.delivery_mode === 1 ? 'door' : 'pickup',
      price: tariff.delivery_sum,
      period_min: tariff.period_min,
      period_max: tariff.period_max,
      icon: tariff.delivery_mode === 1 ? '🚚' : '🏪'
    }));

    return new Response(
      JSON.stringify({ tariffs: formattedTariffs }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in cdek-delivery function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});