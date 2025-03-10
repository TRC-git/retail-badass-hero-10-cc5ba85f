import { useState, useEffect } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { defaultLightColors, defaultDarkColors } from "@/types/settings";

export const useSettingsForm = () => {
  const { settings } = useSettings();
  
  // Local state for form values
  const [taxRate, setTaxRate] = useState<number>(settings.taxRate);
  const [tabEnabled, setTabEnabled] = useState<boolean>(settings.tabEnabled);
  const [tabThreshold, setTabThreshold] = useState<number>(settings.tabThreshold);
  const [tabMaxDays, setTabMaxDays] = useState<number>(settings.tabMaxDays);
  const [tabAutoClosePolicy, setTabAutoClosePolicy] = useState<"manual" | "daily" | "weekly" | "threshold">(settings.tabAutoClosePolicy);
  const [tabCustomerEligibility, setTabCustomerEligibility] = useState<"all" | "registered" | "approved">(settings.tabCustomerEligibility);
  const [tabNotifications, setTabNotifications] = useState<boolean>(settings.tabNotifications);
  
  // Customer tier thresholds
  const [tierThresholdSilver, setTierThresholdSilver] = useState<number>(settings.tierThresholdSilver);
  const [tierThresholdGold, setTierThresholdGold] = useState<number>(settings.tierThresholdGold);
  
  // Stripe API integration fields
  const [stripeLiveSecretKey, setStripeLiveSecretKey] = useState<string>("");
  const [stripeLivePublicKey, setStripeLivePublicKey] = useState<string>("");
  const [stripeTestSecretKey, setStripeTestSecretKey] = useState<string>("");
  const [stripeTestPublicKey, setStripeTestPublicKey] = useState<string>("");
  const [stripeMode, setStripeMode] = useState<"live" | "test">("test");
  
  // GoHighLevel integration fields
  const [goHighLevelApiKey, setGoHighLevelApiKey] = useState<string>("");
  const [highlevelClientId, setHighlevelClientId] = useState<string>("");
  const [highlevelClientSecret, setHighlevelClientSecret] = useState<string>("");
  const [highlevelAccessToken, setHighlevelAccessToken] = useState<string>("");
  const [highlevelRefreshToken, setHighlevelRefreshToken] = useState<string>("");
  const [highlevelTokenExpiresAt, setHighlevelTokenExpiresAt] = useState<Date | undefined>(undefined);
  const [highlevelLocationId, setHighlevelLocationId] = useState<string>("");
  const [highlevelOAuthEnabled, setHighlevelOAuthEnabled] = useState<boolean>(false);
  
  // Theme settings
  const [theme, setTheme] = useState<"light" | "dark">(settings.theme);
  const [lightBackground, setLightBackground] = useState<string>(settings.lightModeColors.background);
  const [lightSidebar, setLightSidebar] = useState<string>(settings.lightModeColors.sidebar);
  const [lightAccent, setLightAccent] = useState<string>(settings.lightModeColors.accent);
  const [lightContainer, setLightContainer] = useState<string>(settings.lightModeColors.container);
  const [lightSection, setLightSection] = useState<string>(settings.lightModeColors.section);
  const [lightSectionSelected, setLightSectionSelected] = useState<string>(settings.lightModeColors.sectionSelected);
  
  const [darkBackground, setDarkBackground] = useState<string>(settings.darkModeColors.background);
  const [darkSidebar, setDarkSidebar] = useState<string>(settings.darkModeColors.sidebar);
  const [darkAccent, setDarkAccent] = useState<string>(settings.darkModeColors.accent);
  const [darkContainer, setDarkContainer] = useState<string>(settings.darkModeColors.container);
  const [darkSection, setDarkSection] = useState<string>(settings.darkModeColors.section);
  const [darkSectionSelected, setDarkSectionSelected] = useState<string>(settings.darkModeColors.sectionSelected);
  
  // Update CSS variables when accent color changes
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === "light") {
      root.style.setProperty('--theme-accent-color', lightAccent);
    } else {
      root.style.setProperty('--theme-accent-color', darkAccent);
    }
  }, [theme, lightAccent, darkAccent]);
  
  // Sync local state with context when settings change
  useEffect(() => {
    setTaxRate(settings.taxRate);
    setTabEnabled(settings.tabEnabled);
    setTabThreshold(settings.tabThreshold);
    setTabMaxDays(settings.tabMaxDays);
    setTabAutoClosePolicy(settings.tabAutoClosePolicy);
    setTabCustomerEligibility(settings.tabCustomerEligibility);
    setTabNotifications(settings.tabNotifications);
    setTierThresholdSilver(settings.tierThresholdSilver);
    setTierThresholdGold(settings.tierThresholdGold);
    
    // If we have these settings stored, load them
    if (settings.stripeLiveSecretKey) setStripeLiveSecretKey(settings.stripeLiveSecretKey);
    if (settings.stripeLivePublicKey) setStripeLivePublicKey(settings.stripeLivePublicKey);
    if (settings.stripeTestSecretKey) setStripeTestSecretKey(settings.stripeTestSecretKey);
    if (settings.stripeTestPublicKey) setStripeTestPublicKey(settings.stripeTestPublicKey);
    if (settings.stripeMode) setStripeMode(settings.stripeMode);
    if (settings.goHighLevelApiKey) setGoHighLevelApiKey(settings.goHighLevelApiKey);
    
    // Load GoHighLevel OAuth settings
    if (settings.highlevelClientId) setHighlevelClientId(settings.highlevelClientId);
    if (settings.highlevelClientSecret) setHighlevelClientSecret(settings.highlevelClientSecret);
    if (settings.highlevelAccessToken) setHighlevelAccessToken(settings.highlevelAccessToken);
    if (settings.highlevelRefreshToken) setHighlevelRefreshToken(settings.highlevelRefreshToken);
    if (settings.highlevelTokenExpiresAt) setHighlevelTokenExpiresAt(settings.highlevelTokenExpiresAt);
    if (settings.highlevelLocationId) setHighlevelLocationId(settings.highlevelLocationId);
    setHighlevelOAuthEnabled(settings.highlevelOAuthEnabled || false);
    
    // Theme settings
    setTheme(settings.theme);
    
    // Light Mode Colors
    const lightColors = settings.lightModeColors || defaultLightColors;
    setLightBackground(lightColors.background);
    setLightSidebar(lightColors.sidebar);
    setLightAccent(lightColors.accent);
    setLightContainer(lightColors.container);
    setLightSection(lightColors.section);
    setLightSectionSelected(lightColors.sectionSelected);
    
    // Dark Mode Colors
    const darkColors = settings.darkModeColors || defaultDarkColors;
    setDarkBackground(darkColors.background);
    setDarkSidebar(darkColors.sidebar);
    setDarkAccent(darkColors.accent);
    setDarkContainer(darkColors.container);
    setDarkSection(darkColors.section);
    setDarkSectionSelected(darkColors.sectionSelected);
  }, [settings]);

  return {
    // General settings state and setters
    taxRate, setTaxRate,
    tabEnabled, setTabEnabled,
    tabThreshold, setTabThreshold,
    tabMaxDays, setTabMaxDays,
    tabAutoClosePolicy, setTabAutoClosePolicy,
    tabCustomerEligibility, setTabCustomerEligibility,
    tabNotifications, setTabNotifications,
    
    // Customer tier thresholds
    tierThresholdSilver, setTierThresholdSilver,
    tierThresholdGold, setTierThresholdGold,
    
    // Stripe integration state and setters
    stripeLiveSecretKey, setStripeLiveSecretKey,
    stripeLivePublicKey, setStripeLivePublicKey,
    stripeTestSecretKey, setStripeTestSecretKey,
    stripeTestPublicKey, setStripeTestPublicKey,
    stripeMode, setStripeMode,
    
    // GoHighLevel integration state and setters
    goHighLevelApiKey, setGoHighLevelApiKey,
    highlevelClientId, setHighlevelClientId,
    highlevelClientSecret, setHighlevelClientSecret,
    highlevelAccessToken, setHighlevelAccessToken,
    highlevelRefreshToken, setHighlevelRefreshToken,
    highlevelTokenExpiresAt, setHighlevelTokenExpiresAt,
    highlevelLocationId, setHighlevelLocationId,
    highlevelOAuthEnabled, setHighlevelOAuthEnabled,
    
    // Theme settings state and setters
    theme, setTheme,
    
    // Light mode colors state and setters
    lightBackground, setLightBackground,
    lightSidebar, setLightSidebar,
    lightAccent, setLightAccent,
    lightContainer, setLightContainer,
    lightSection, setLightSection,
    lightSectionSelected, setLightSectionSelected,
    
    // Dark mode colors state and setters
    darkBackground, setDarkBackground,
    darkSidebar, setDarkSidebar,
    darkAccent, setDarkAccent,
    darkContainer, setDarkContainer,
    darkSection, setDarkSection,
    darkSectionSelected, setDarkSectionSelected,
  };
};
