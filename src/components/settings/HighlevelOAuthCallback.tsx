import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const HighlevelOAuthCallback = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get the authorization code and other params from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const locationId = urlParams.get('locationId');
        const companyId = urlParams.get('companyId');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        if (error) {
          throw new Error(errorDescription || 'Authorization failed');
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Exchange the code for access token
        const response = await fetch('https://services.leadconnectorhq.com/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
          body: new URLSearchParams({
            client_id: import.meta.env.VITE_GHL_CLIENT_ID,
            client_secret: import.meta.env.VITE_GHL_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: `${window.location.origin}/settings/highlevel/callback`,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to exchange authorization code');
        }

        const data = await response.json();

        // Verify the token by making a test API call
        const verifyResponse = await fetch('https://services.leadconnectorhq.com/oauth/tokeninfo', {
          headers: {
            'Authorization': `Bearer ${data.access_token}`,
            'Version': '2021-07-28',
          },
        });

        if (!verifyResponse.ok) {
          throw new Error('Failed to verify access token');
        }

        const verifyData = await verifyResponse.json();

        // Update settings with the new tokens and metadata
        await updateSettings({
          ...settings,
          highlevelAccessToken: data.access_token,
          highlevelRefreshToken: data.refresh_token,
          highlevelTokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
          highlevelLocationId: locationId || null,
          highlevelCompanyId: companyId || null,
          highlevelOAuthEnabled: true,
          highlevelTokenType: data.token_type,
          highlevelScopes: verifyData.scopes,
        });

        // Redirect back to settings page
        navigate('/settings');
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err instanceof Error ? err.message : 'Failed to complete OAuth flow');
      }
    };

    handleOAuthCallback();
  }, [navigate, settings, updateSettings]);

  if (error) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="pt-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Authentication Error</h2>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardContent className="pt-6">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Completing Authentication</h2>
          <p className="text-sm text-gray-600">Please wait while we complete the authentication process...</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HighlevelOAuthCallback; 