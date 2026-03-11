import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminSession } from "@/hooks/useAdminSession";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { type FormEvent, useState } from "react";

const ADMIN_EMAIL = "jatinsharmas336@gmail.com";

export function AdminLoginCard() {
  const { login, isActorFetching } = useAdminSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    // Only the admin email is allowed here
    if (email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      setError(
        "This email is not an admin account. Please use the Client Portal to login as a client.",
      );
      return;
    }

    setIsLoading(true);

    try {
      await login(password);
      // On success the adminToken state updates and the parent re-renders to show the dashboard
    } catch (err: any) {
      setError(err?.message ?? "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = isLoading;

  return (
    <Card className="bg-neutral-900 border-neutral-800 max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-gold" />
          </div>
          <div>
            <CardTitle className="text-gold text-2xl">Admin Login</CardTitle>
            <CardDescription className="text-white/70 text-base mt-1">
              Enter your admin credentials to access the dashboard
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email" className="text-white">
              Email
            </Label>
            <Input
              id="admin-email"
              type="email"
              placeholder="Enter admin email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              required
              autoFocus
              disabled={isDisabled}
              data-ocid="admin.input"
              className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50 h-12 disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-password" className="text-white">
              Password
            </Label>
            <Input
              id="admin-password"
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              required
              disabled={isDisabled}
              data-ocid="admin.input"
              className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50 h-12 disabled:opacity-50"
            />
          </div>

          {error && (
            <Alert
              className="bg-neutral-800 border-gold/50"
              data-ocid="admin.error_state"
            >
              <AlertCircle className="h-4 w-4 text-gold" />
              <AlertDescription className="text-white/90">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {isActorFetching && !isLoading && !error && (
            <Alert className="bg-blue-950/50 border-blue-900">
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription className="text-white/90">
                Initializing service...
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={isDisabled || !email.trim() || !password.trim()}
            data-ocid="admin.submit_button"
            className="w-full bg-gold hover:bg-gold/90 text-black font-bold text-lg h-12 rounded-lg disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
