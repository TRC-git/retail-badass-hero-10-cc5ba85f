import React from "react";
import StripeIntegration from "./StripeIntegration";
import GoHighLevelIntegration from "./GoHighLevelIntegration";

interface IntegrationSettingsProps {
  stripeLiveSecretKey: string;
  setStripeLiveSecretKey: (value: string) => void;
  stripeLivePublicKey: string;
  setStripeLivePublicKey: (value: string) => void;
  stripeTestSecretKey: string;
  setStripeTestSecretKey: (value: string) => void;
  stripeTestPublicKey: string;
  setStripeTestPublicKey: (value: string) => void;
  stripeMode: "live" | "test";
  setStripeMode: (value: "live" | "test") => void;
  goHighLevelApiKey: string;
  setGoHighLevelApiKey: (value: string) => void;
  highlevelAccessToken?: string;
  highlevelRefreshToken?: string;
  highlevelTokenExpiresAt?: Date;
  highlevelLocationId?: string;
  highlevelOAuthEnabled: boolean;
  setHighlevelOAuthEnabled: (value: boolean) => void;
}

const IntegrationSettings = ({
  stripeLiveSecretKey,
  setStripeLiveSecretKey,
  stripeLivePublicKey,
  setStripeLivePublicKey,
  stripeTestSecretKey,
  setStripeTestSecretKey,
  stripeTestPublicKey,
  setStripeTestPublicKey,
  stripeMode,
  setStripeMode,
  goHighLevelApiKey,
  setGoHighLevelApiKey,
  highlevelAccessToken,
  highlevelRefreshToken,
  highlevelTokenExpiresAt,
  highlevelLocationId,
  highlevelOAuthEnabled,
  setHighlevelOAuthEnabled,
}: IntegrationSettingsProps) => {
  return (
    <>
      <StripeIntegration 
        stripeLiveSecretKey={stripeLiveSecretKey}
        setStripeLiveSecretKey={setStripeLiveSecretKey}
        stripeLivePublicKey={stripeLivePublicKey}
        setStripeLivePublicKey={setStripeLivePublicKey}
        stripeTestSecretKey={stripeTestSecretKey}
        setStripeTestSecretKey={setStripeTestSecretKey}
        stripeTestPublicKey={stripeTestPublicKey}
        setStripeTestPublicKey={setStripeTestPublicKey}
        stripeMode={stripeMode}
        setStripeMode={setStripeMode}
      />
      
      <GoHighLevelIntegration 
        goHighLevelApiKey={goHighLevelApiKey}
        setGoHighLevelApiKey={setGoHighLevelApiKey}
        highlevelAccessToken={highlevelAccessToken}
        highlevelRefreshToken={highlevelRefreshToken}
        highlevelTokenExpiresAt={highlevelTokenExpiresAt}
        highlevelLocationId={highlevelLocationId}
        highlevelOAuthEnabled={highlevelOAuthEnabled}
        setHighlevelOAuthEnabled={setHighlevelOAuthEnabled}
      />
    </>
  );
};

export default IntegrationSettings;
