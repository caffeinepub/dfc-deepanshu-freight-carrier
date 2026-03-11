import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, LogIn, LogOut } from "lucide-react";

export function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error("Login error:", error);
        if (error.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <Button
      onClick={handleAuth}
      disabled={isLoggingIn}
      variant={isAuthenticated ? "outline" : "default"}
      className={
        isAuthenticated
          ? "border-gold text-gold hover:bg-gold/10"
          : "bg-gold hover:bg-gold/90 text-black font-semibold"
      }
    >
      {isLoggingIn ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Connecting...
        </>
      ) : isAuthenticated ? (
        <>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </>
      ) : (
        <>
          <LogIn className="w-4 h-4 mr-2" />
          Internet Identity
        </>
      )}
    </Button>
  );
}
