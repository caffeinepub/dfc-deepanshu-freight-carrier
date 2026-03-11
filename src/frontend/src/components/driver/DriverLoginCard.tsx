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
import { AlertCircle, Loader2, LogIn, Truck } from "lucide-react";
import { type FormEvent, useState } from "react";

interface Driver {
  id: string;
  name: string;
  mobile: string;
  status: "Pending" | "Approved" | "Rejected";
}

interface DriverLoginCardProps {
  onLogin: () => void;
}

export function DriverLoginCard({ onLogin }: DriverLoginCardProps) {
  const [mobile, setMobile] = useState("");
  const [driverId, setDriverId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!mobile.trim() || !driverId.trim()) {
      setError("Please enter both Mobile Number and Driver ID.");
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((r) => setTimeout(r, 400));

      const drivers: Driver[] = JSON.parse(
        localStorage.getItem("dfc_drivers") || "[]",
      );
      const found = drivers.find(
        (d) =>
          d.mobile === mobile.trim() && d.id === driverId.trim().toUpperCase(),
      );

      if (!found) {
        setError(
          "No driver found with those credentials. Please check and try again.",
        );
        return;
      }

      if (found.status === "Rejected") {
        setError(
          "Your application has been rejected. Please contact DFC support.",
        );
        return;
      }

      if (found.status === "Pending") {
        setError(
          "Your application is pending admin verification. Please wait for approval.",
        );
        return;
      }

      localStorage.setItem("dfc_driver_session", found.id);
      onLogin();
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-neutral-900 border-neutral-800 max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
            <Truck className="w-6 h-6 text-gold" />
          </div>
          <div>
            <CardTitle className="text-gold text-2xl">Driver Login</CardTitle>
            <CardDescription className="text-white/70">
              Enter your registered mobile and Driver ID
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="drv-login-mobile" className="text-white">
              Mobile Number
            </Label>
            <Input
              id="drv-login-mobile"
              type="tel"
              placeholder="Registered mobile number"
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
                if (error) setError("");
              }}
              required
              maxLength={10}
              autoFocus
              disabled={isLoading}
              data-ocid="driver.input"
              className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/40 h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="drv-login-id" className="text-white">
              Driver ID
            </Label>
            <Input
              id="drv-login-id"
              type="text"
              placeholder="e.g. DRV1A2B3C4D"
              value={driverId}
              onChange={(e) => {
                setDriverId(e.target.value.toUpperCase());
                if (error) setError("");
              }}
              required
              disabled={isLoading}
              data-ocid="driver.input"
              className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/40 h-11 font-mono tracking-wider"
            />
          </div>

          {error && (
            <Alert
              className="bg-red-950/50 border-red-900"
              data-ocid="driver.error_state"
            >
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-white/90">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={isLoading || !mobile.trim() || !driverId.trim()}
            data-ocid="driver.submit_button"
            className="w-full bg-gold hover:bg-gold/90 text-black font-bold text-lg h-12 rounded-lg disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
