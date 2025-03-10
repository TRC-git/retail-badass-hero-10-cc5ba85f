import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GoHighLevelIntegrationProps {
  goHighLevelApiKey: string;
  setGoHighLevelApiKey: (value: string) => void;
  highlevelAccessToken?: string;
  highlevelRefreshToken?: string;
  highlevelTokenExpiresAt?: Date;
  highlevelLocationId?: string;
  highlevelOAuthEnabled: boolean;
  setHighlevelOAuthEnabled: (value: boolean) => void;
}

const GoHighLevelIntegration = ({
  goHighLevelApiKey,
  setGoHighLevelApiKey,
  highlevelAccessToken,
  highlevelOAuthEnabled,
  setHighlevelOAuthEnabled,
}: GoHighLevelIntegrationProps) => {
  // Password visibility toggle
  const [showGoHighLevelKey, setShowGoHighLevelKey] = useState<boolean>(false);
  const [accessLevel, setAccessLevel] = useState<"location" | "agency">("location");

  const handleOAuthConnect = () => {
    // Construct OAuth URL with all required scopes
    const scopes = [
      "locations.readonly",
      "locations.write",
      "calendars.readonly",
      "calendars.write",
      "calendars/events.write",
      "contacts.write",
      "calendars/groups.write",
      "businesses.readonly",
      "businesses.write",
      "calendars/events.readonly",
      "calendars/groups.readonly",
      "conversations.readonly",
      "campaigns.readonly",
      "conversations.write",
      "conversations/message.readonly",
      "conversations/message.write",
      "contacts.readonly",
      "forms.readonly",
      "forms.write",
      "links.readonly",
      "links.write",
      "locations/customValues.readonly",
      "locations/customValues.write",
      "locations/customFields.readonly",
      "locations/tasks.readonly",
      "locations/customFields.write",
      "locations/tasks.write",
      "locations/tags.readonly",
      "locations/templates.readonly",
      "medias.write",
      "locations/tags.write",
      "medias.readonly",
      "opportunities.readonly",
      "opportunities.write",
      "surveys.readonly",
      "users.readonly",
      "users.write",
      "workflows.readonly",
      "snapshots.readonly",
      "oauth.write",
      "oauth.readonly"
    ].join(" ");

    const redirectUri = `${window.location.origin}/settings/crm/oauth/callback`;
    
    // Start with marketplace OAuth endpoint for location/company selection
    const oauthUrl = `https://marketplace.leadconnectorhq.com/oauth/chooselocation?` + 
      `response_type=code` +
      `&client_id=${import.meta.env.VITE_GHL_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&userType=${accessLevel === "agency" ? "Company" : "Location"}` +
      `&loginWindowOpenMode=self`;
    
    window.location.href = oauthUrl;
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>GoHighLevel Integration</CardTitle>
        <CardDescription>
          Configure GoHighLevel CRM integration. You can use either the API Key (Simple API) or OAuth2 authentication.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <Switch
            id="oauth-enabled"
            checked={highlevelOAuthEnabled}
            onCheckedChange={setHighlevelOAuthEnabled}
          />
          <Label htmlFor="oauth-enabled">Use OAuth2 Authentication (Recommended)</Label>
        </div>

        {highlevelOAuthEnabled ? (
          <>
            <div className="space-y-1">
              <Label htmlFor="access-level">Access Level</Label>
              <Select
                value={accessLevel}
                onValueChange={(value: "location" | "agency") => setAccessLevel(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select access level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="location">Location Level (Sub-Account)</SelectItem>
                  <SelectItem value="agency">Agency Level (Company)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                {accessLevel === "location" 
                  ? "Location Level access allows operations specific to a single sub-account."
                  : "Agency Level access enables management across the entire agency."
                }
              </p>
            </div>

            <Button 
              onClick={handleOAuthConnect}
              className="w-full"
            >
              Connect with GoHighLevel
            </Button>

            {highlevelAccessToken && (
              <div className="p-4 bg-green-100 dark:bg-green-900 rounded-md">
                <p className="text-sm text-green-700 dark:text-green-300">
                  Successfully connected to GoHighLevel via OAuth
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-1">
            <Label htmlFor="gohighlevel-api-key">API Key (Simple API)</Label>
            <div className="relative">
              <Input
                id="gohighlevel-api-key"
                value={goHighLevelApiKey}
                onChange={(e) => setGoHighLevelApiKey(e.target.value)}
                type={showGoHighLevelKey ? "text" : "password"}
                className="pr-10"
                placeholder="Enter your GoHighLevel API key"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowGoHighLevelKey(!showGoHighLevelKey)}
              >
                {showGoHighLevelKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Your GoHighLevel API key for connecting your POS to the CRM.
            </p>
          </div>
        )}
        
        <div className="p-4 bg-muted/20 rounded-md mt-4">
          <h3 className="font-medium mb-2">Integration Status</h3>
          <p className="text-sm text-muted-foreground">
            {highlevelOAuthEnabled 
              ? highlevelAccessToken 
                ? "GoHighLevel OAuth integration is active."
                : "GoHighLevel OAuth integration is not configured yet."
              : goHighLevelApiKey 
                ? "GoHighLevel API Key integration is configured. Save to apply changes."
                : "GoHighLevel integration is not configured yet."
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoHighLevelIntegration;
