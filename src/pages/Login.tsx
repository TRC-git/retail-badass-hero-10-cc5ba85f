
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/contexts/SettingsContext";
import LoginForm from "@/components/auth/LoginForm";
import PasswordSetupForm from "@/components/auth/PasswordSetupForm";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstTimeLogin, setIsFirstTimeLogin] = useState(false);
  const { signIn, isAuthenticated } = useAuth();
  const { settings } = useSettings();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      const errorMessage = error.message || "Failed to sign in";
      
      if (errorMessage.includes("Invalid login credentials")) {
        const { data: staffData } = await supabase
          .from('staff')
          .select('email')
          .eq('email', email)
          .single();
        
        if (staffData) {
          setIsFirstTimeLogin(true);
          toast.info("First time login detected. Please set your password.");
        } else {
          toast.error("No staff account found with this email");
        }
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setIsLoading(true);
    try {
      // First create the user account since it doesn't exist yet
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password: newPassword,
      });
      
      if (signUpError) throw signUpError;
      
      toast.success("Password set successfully! You can now login");
      
      // Automatically sign in with the new credentials
      await signIn(email, newPassword);
    } catch (error: any) {
      // Handle case where user might already exist in auth but failed login
      if (error.message.includes("User already registered")) {
        try {
          // Try to update password instead
          const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword
          });
          
          if (updateError) throw updateError;
          
          toast.success("Password updated successfully! You can now login");
          await signIn(email, newPassword);
        } catch (updateError: any) {
          toast.error(updateError.message || "Failed to update password");
        }
      } else {
        toast.error(error.message || "Failed to set password");
      }
    } finally {
      setIsLoading(false);
      setIsFirstTimeLogin(false);
    }
  };

  // Return to login form
  const handleBackToLogin = () => {
    setIsFirstTimeLogin(false);
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isFirstTimeLogin ? `Set Your Password` : `${settings.storeName || "NextPOS"} Staff Login`}
          </CardTitle>
          <CardDescription className="text-center">
            {isFirstTimeLogin 
              ? "Welcome! Please set your password to continue" 
              : "Enter your credentials to sign in to your account"}
          </CardDescription>
        </CardHeader>
        
        {isFirstTimeLogin ? (
          <PasswordSetupForm
            email={email}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            handleSetPassword={handleSetPassword}
            handleBackToLogin={handleBackToLogin}
            isLoading={isLoading}
          />
        ) : (
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            handleSignIn={handleSignIn}
            isLoading={isLoading}
            onFirstTimeLoginDetected={setIsFirstTimeLogin}
          />
        )}
      </Card>
    </div>
  );
};

export default Login;
