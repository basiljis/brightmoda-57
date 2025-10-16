import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [settings, setSettings] = useState({
    enabled: true,
    title: "Использование файлов cookie",
    text: "Мы используем файлы cookie для улучшения работы сайта и анализа трафика. Продолжая использовать сайт, вы соглашаетесь с нашей политикой обработки персональных данных.",
    buttonText: "Принять",
    position: "bottom",
    privacyLink: "/privacy-policy"
  });

  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("cookie_consent_enabled, cookie_consent_title, cookie_consent_text, cookie_consent_button_text, cookie_consent_position, cookie_consent_privacy_link")
        .single();

      if (data) {
        setSettings({
          enabled: data.cookie_consent_enabled ?? true,
          title: data.cookie_consent_title || settings.title,
          text: data.cookie_consent_text || settings.text,
          buttonText: data.cookie_consent_button_text || settings.buttonText,
          position: data.cookie_consent_position || settings.position,
          privacyLink: data.cookie_consent_privacy_link || settings.privacyLink
        });
      }
    };

    loadSettings();

    const hasAccepted = localStorage.getItem("cookie-consent-accepted");
    if (!hasAccepted) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent-accepted", "true");
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!settings.enabled || !isVisible) {
    return null;
  }

  const positionClasses = settings.position === "top" 
    ? "top-0 left-0 right-0" 
    : "bottom-0 left-0 right-0";

  return (
    <div className={`fixed ${positionClasses} z-50 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg`}>
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-sm">
          {settings.title && (
            <h3 className="font-semibold mb-2">{settings.title}</h3>
          )}
          <p className="text-muted-foreground">
            {settings.text}{" "}
            {settings.privacyLink && (
              <Link 
                to={settings.privacyLink} 
                className="underline hover:text-foreground transition-colors"
              >
                Подробнее
              </Link>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleAccept} size="sm">
            {settings.buttonText}
          </Button>
          <Button 
            onClick={handleDismiss} 
            variant="ghost" 
            size="icon"
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
