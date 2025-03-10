export interface ThemeColors {
  background: string;
  sidebar: string;
  accent: string;
  text: string;
  accentHover: string;
  sidebarHover: string;
  container: string;
  section: string;
  sectionSelected: string;
}

export interface POSSettings {
  id?: string;
  taxRate: number;
  tabEnabled: boolean;
  tabThreshold: number;
  tabMaxDays: number;
  // Tab System Advanced Settings
  tabAutoClosePolicy: "manual" | "daily" | "weekly" | "threshold";
  tabCustomerEligibility: "all" | "registered" | "approved";
  tabNotifications: boolean;
  // Store Information
  storeName: string;
  storeAddress?: string;
  storePhone?: string;
  logoUrl?: string;
  // Stripe Integration
  stripeLiveSecretKey?: string;
  stripeLivePublicKey?: string;
  stripeTestSecretKey?: string;
  stripeTestPublicKey?: string;
  stripeMode?: "live" | "test";
  // GoHighLevel Integration
  goHighLevelApiKey?: string;
  highlevelClientId?: string;
  highlevelClientSecret?: string;
  highlevelAccessToken?: string;
  highlevelRefreshToken?: string;
  highlevelTokenExpiresAt?: Date;
  highlevelLocationId?: string;
  highlevelCompanyId?: string;
  highlevelOAuthEnabled?: boolean;
  highlevelTokenType?: string;
  highlevelScopes?: string[];
  // Theme Settings
  theme: "light" | "dark";
  lightModeColors: ThemeColors;
  darkModeColors: ThemeColors;
  // Customer Tier Settings
  tierThresholdSilver: number;
  tierThresholdGold: number;
}

export interface SettingsContextType {
  settings: POSSettings;
  updateSettings: (newSettings: Partial<POSSettings>) => Promise<void>;
  isLoading: boolean;
  saveSettings: () => Promise<void>;
}

// Default theme settings
export const defaultLightColors: ThemeColors = {
  background: "#ffffff",
  sidebar: "#f0f4f8",
  accent: "#3b82f6",
  text: "#1e293b",
  accentHover: "#2563eb",
  sidebarHover: "#e0e7ff",
  container: "#f9fafb",
  section: "#f1f5f9",
  sectionSelected: "#e2e8f0",
};

export const defaultDarkColors: ThemeColors = {
  background: "#171717",
  sidebar: "#000000",
  accent: "#15e7fb",
  text: "#f8fafc",
  accentHover: "#3b82f6",
  sidebarHover: "#334155",
  container: "#101010",
  section: "#202020",
  sectionSelected: "#0f172a",
};

export const defaultSettings: POSSettings = {
  taxRate: 8.0,
  tabEnabled: true,
  tabThreshold: 100,
  tabMaxDays: 7,
  tabAutoClosePolicy: "manual",
  tabCustomerEligibility: "all",
  tabNotifications: true,
  storeName: "NextPOS",
  stripeMode: "test",
  theme: "dark",
  lightModeColors: defaultLightColors,
  darkModeColors: defaultDarkColors,
  tierThresholdSilver: 500,
  tierThresholdGold: 2000,
  highlevelOAuthEnabled: false
};
