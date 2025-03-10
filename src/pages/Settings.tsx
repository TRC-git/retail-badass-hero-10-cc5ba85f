import React from "react";
import Layout from "@/components/Layout";
import { TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

// Import refactored components
import GeneralSettings from "@/components/settings/GeneralSettings";
import TaxSettings from "@/components/settings/TaxSettings";
import TabSettings from "@/components/settings/TabSettings";
import IntegrationSettings from "@/components/settings/IntegrationSettings";
import DesignSettings from "@/components/settings/DesignSettings";
import StaffSettings from "@/components/settings/StaffSettings";
import CustomerTierSettings from "@/components/settings/CustomerTierSettings";
import SettingsContainer from "@/components/settings/SettingsContainer";
import { useSettingsForm } from "@/hooks/useSettingsForm";

const Settings = () => {
  const { isAuthenticated, loading } = useAuth();
  const settingsForm = useSettingsForm();
  
  // Redirect to login page if not authenticated
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <SettingsContainer
        taxRate={settingsForm.taxRate}
        tabEnabled={settingsForm.tabEnabled}
        tabThreshold={settingsForm.tabThreshold}
        tabMaxDays={settingsForm.tabMaxDays}
        tabAutoClosePolicy={settingsForm.tabAutoClosePolicy}
        tabCustomerEligibility={settingsForm.tabCustomerEligibility}
        tabNotifications={settingsForm.tabNotifications}
        tierThresholdSilver={settingsForm.tierThresholdSilver}
        tierThresholdGold={settingsForm.tierThresholdGold}
        stripeLiveSecretKey={settingsForm.stripeLiveSecretKey}
        stripeLivePublicKey={settingsForm.stripeLivePublicKey}
        stripeTestSecretKey={settingsForm.stripeTestSecretKey}
        stripeTestPublicKey={settingsForm.stripeTestPublicKey}
        stripeMode={settingsForm.stripeMode}
        goHighLevelApiKey={settingsForm.goHighLevelApiKey}
        theme={settingsForm.theme}
        lightBackground={settingsForm.lightBackground}
        lightSidebar={settingsForm.lightSidebar}
        lightAccent={settingsForm.lightAccent}
        darkBackground={settingsForm.darkBackground}
        darkSidebar={settingsForm.darkSidebar}
        darkAccent={settingsForm.darkAccent}
        lightContainer={settingsForm.lightContainer}
        darkContainer={settingsForm.darkContainer}
        lightSection={settingsForm.lightSection}
        darkSection={settingsForm.darkSection}
        lightSectionSelected={settingsForm.lightSectionSelected}
        darkSectionSelected={settingsForm.darkSectionSelected}
      >
        {/* General Settings Tab */}
        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>
        
        {/* Tax Settings Tab */}
        <TabsContent value="tax">
          <TaxSettings 
            taxRate={settingsForm.taxRate}
            setTaxRate={settingsForm.setTaxRate}
          />
        </TabsContent>
        
        {/* Tab System Settings */}
        <TabsContent value="tab">
          <TabSettings 
            tabEnabled={settingsForm.tabEnabled}
            setTabEnabled={settingsForm.setTabEnabled}
            tabThreshold={settingsForm.tabThreshold}
            setTabThreshold={settingsForm.setTabThreshold}
            tabMaxDays={settingsForm.tabMaxDays}
            setTabMaxDays={settingsForm.setTabMaxDays}
            tabAutoClosePolicy={settingsForm.tabAutoClosePolicy}
            setTabAutoClosePolicy={settingsForm.setTabAutoClosePolicy}
            tabCustomerEligibility={settingsForm.tabCustomerEligibility}
            setTabCustomerEligibility={settingsForm.setTabCustomerEligibility}
            tabNotifications={settingsForm.tabNotifications}
            setTabNotifications={settingsForm.setTabNotifications}
          />
        </TabsContent>
        
        {/* Customer Tier Settings */}
        <TabsContent value="tiers">
          <CustomerTierSettings
            tierThresholdSilver={settingsForm.tierThresholdSilver}
            setTierThresholdSilver={settingsForm.setTierThresholdSilver}
            tierThresholdGold={settingsForm.tierThresholdGold}
            setTierThresholdGold={settingsForm.setTierThresholdGold}
          />
        </TabsContent>
        
        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <IntegrationSettings 
            stripeLiveSecretKey={settingsForm.stripeLiveSecretKey}
            setStripeLiveSecretKey={settingsForm.setStripeLiveSecretKey}
            stripeLivePublicKey={settingsForm.stripeLivePublicKey}
            setStripeLivePublicKey={settingsForm.setStripeLivePublicKey}
            stripeTestSecretKey={settingsForm.stripeTestSecretKey}
            setStripeTestSecretKey={settingsForm.setStripeTestSecretKey}
            stripeTestPublicKey={settingsForm.stripeTestPublicKey}
            setStripeTestPublicKey={settingsForm.setStripeTestPublicKey}
            stripeMode={settingsForm.stripeMode}
            setStripeMode={settingsForm.setStripeMode}
            goHighLevelApiKey={settingsForm.goHighLevelApiKey}
            setGoHighLevelApiKey={settingsForm.setGoHighLevelApiKey}
            highlevelAccessToken={settingsForm.highlevelAccessToken}
            highlevelRefreshToken={settingsForm.highlevelRefreshToken}
            highlevelTokenExpiresAt={settingsForm.highlevelTokenExpiresAt}
            highlevelLocationId={settingsForm.highlevelLocationId}
            highlevelOAuthEnabled={settingsForm.highlevelOAuthEnabled}
            setHighlevelOAuthEnabled={settingsForm.setHighlevelOAuthEnabled}
          />
        </TabsContent>
        
        {/* Design Tab */}
        <TabsContent value="design">
          <DesignSettings 
            theme={settingsForm.theme}
            setTheme={settingsForm.setTheme}
            lightBackground={settingsForm.lightBackground}
            setLightBackground={settingsForm.setLightBackground}
            lightSidebar={settingsForm.lightSidebar}
            setLightSidebar={settingsForm.setLightSidebar}
            lightAccent={settingsForm.lightAccent}
            setLightAccent={settingsForm.setLightAccent}
            darkBackground={settingsForm.darkBackground}
            setDarkBackground={settingsForm.setDarkBackground}
            darkSidebar={settingsForm.darkSidebar}
            setDarkSidebar={settingsForm.setDarkSidebar}
            darkAccent={settingsForm.darkAccent}
            setDarkAccent={settingsForm.setDarkAccent}
            lightContainer={settingsForm.lightContainer}
            setLightContainer={settingsForm.setLightContainer}
            darkContainer={settingsForm.darkContainer}
            setDarkContainer={settingsForm.setDarkContainer}
            lightSection={settingsForm.lightSection}
            setLightSection={settingsForm.setLightSection}
            darkSection={settingsForm.darkSection}
            setDarkSection={settingsForm.setDarkSection}
            lightSectionSelected={settingsForm.lightSectionSelected}
            setLightSectionSelected={settingsForm.setLightSectionSelected}
            darkSectionSelected={settingsForm.darkSectionSelected}
            setDarkSectionSelected={settingsForm.setDarkSectionSelected}
          />
        </TabsContent>
        
        {/* Staff Tab */}
        <TabsContent value="staff">
          <StaffSettings />
        </TabsContent>
      </SettingsContainer>
    </Layout>
  );
};

export default Settings;
