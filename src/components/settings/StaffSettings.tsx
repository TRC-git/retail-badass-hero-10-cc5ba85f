
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSettings } from "@/contexts/SettingsContext";
import StaffList from "./staff/StaffList";
import StaffHeader from "./staff/StaffHeader";
import StaffFormDialog from "./staff/StaffFormDialog";
import { useStaffManagement } from "@/hooks/staff";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const StaffSettings = () => {
  const { settings } = useSettings();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(true);
  
  const {
    staffMembers,
    loading,
    syncing,
    isEditing,
    email,
    firstName,
    lastName,
    role,
    password,
    setEmail,
    setFirstName,
    setLastName,
    setRole,
    setPassword,
    handleAddStaff,
    handleEditStaff,
    handleDeleteStaff,
    startEdit,
    resetForm,
    syncWithGoHighLevel,
    refetch
  } = useStaffManagement();

  // Check Supabase connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Simple query to check connection
        const { error } = await supabase.from('staff').select('id').limit(1);
        
        if (error) {
          console.error("Supabase connection check failed:", error);
          setSupabaseConnected(false);
          toast.error("Could not connect to Supabase staff table");
        } else {
          console.log("Supabase connection successful, staff table exists");
          setSupabaseConnected(true);
        }
      } catch (err) {
        console.error("Supabase connection error:", err);
        setSupabaseConnected(false);
        toast.error("Failed to connect to database");
      }
    };
    
    checkConnection();
  }, []);

  const goHighLevelApiKey = settings.goHighLevelApiKey;
  
  const handleAddStaffClick = () => {
    resetForm();
    setIsFormOpen(true);
  };
  
  const handleSyncWithGoHighLevel = () => {
    syncWithGoHighLevel(goHighLevelApiKey);
  };

  const handleStartEdit = (staff: any) => {
    startEdit(staff);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    resetForm();
    setIsFormOpen(false);
  };

  const handleRefresh = () => {
    toast.info("Refreshing staff list...");
    refetch();
  };

  return (
    <Card>
      <StaffHeader 
        onAddStaff={handleAddStaffClick}
        onSyncWithGoHighLevel={handleSyncWithGoHighLevel}
        goHighLevelApiKey={goHighLevelApiKey}
        syncing={syncing}
      />
      <CardContent>
        <div className="mb-4 flex justify-between">
          <div>
            {!supabaseConnected && (
              <div className="text-destructive mb-2">
                Warning: Cannot connect to staff database table
              </div>
            )}
            {staffMembers && (
              <div className="text-muted-foreground text-sm">
                Found {staffMembers.length} staff members
              </div>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? "Refreshing..." : "Refresh Staff List"}
          </Button>
        </div>
        
        {/* Staff Form Dialog */}
        <StaffFormDialog
          isOpen={isFormOpen}
          onOpenChange={setIsFormOpen}
          isEditing={isEditing}
          email={email}
          setEmail={setEmail}
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          role={role}
          setRole={setRole}
          password={password}
          setPassword={setPassword}
          resetForm={handleCloseForm}
          handleAddStaff={handleAddStaff}
          handleEditStaff={handleEditStaff}
        />
        
        <StaffList
          staffMembers={staffMembers}
          loading={loading}
          startEdit={handleStartEdit}
          handleDeleteStaff={handleDeleteStaff}
        />
      </CardContent>
    </Card>
  );
};

export default StaffSettings;
