import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Loader2,
  LogOut,
  Package,
  Settings,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Driver {
  id: string;
  name: string;
  mobile: string;
  alternateMobile: string;
  address: string;
  emergency1: string;
  emergency2: string;
  emergency3: string;
  aadharCard: string;
  drivingLicence: string;
  vehicleRC: string;
  vehicleInsurance: string;
  vehiclePhoto: string;
  driverPhoto: string;
  status: "Pending" | "Approved" | "Rejected";
  totalTrips: number;
  totalEarnings: number;
  registeredAt: string;
}

interface DriverDashboardProps {
  onLogout: () => void;
}

function getDriver(driverId: string): Driver | null {
  const drivers: Driver[] = JSON.parse(
    localStorage.getItem("dfc_drivers") || "[]",
  );
  return drivers.find((d) => d.id === driverId) ?? null;
}

function saveDriver(updated: Driver) {
  const drivers: Driver[] = JSON.parse(
    localStorage.getItem("dfc_drivers") || "[]",
  );
  const idx = drivers.findIndex((d) => d.id === updated.id);
  if (idx !== -1) {
    drivers[idx] = updated;
    localStorage.setItem("dfc_drivers", JSON.stringify(drivers));
  }
}

export function DriverDashboard({ onLogout }: DriverDashboardProps) {
  const driverId = localStorage.getItem("dfc_driver_session") || "";
  const [driver, setDriver] = useState<Driver | null>(() =>
    getDriver(driverId),
  );

  // Withdraw dialog
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  // Update vehicle dialog
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [vehicleRC, setVehicleRC] = useState(driver?.vehicleRC || "");
  const [vehicleInsurance, setVehicleInsurance] = useState(
    driver?.vehicleInsurance || "",
  );
  const [vehicleLoading, setVehicleLoading] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("dfc_driver_session");
    onLogout();
  };

  const handleWithdraw = async () => {
    const amount = Number.parseFloat(withdrawAmount);
    if (!withdrawAmount || Number.isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!driver) return;
    if (amount > driver.totalEarnings) {
      toast.error("Insufficient earnings balance");
      return;
    }
    setWithdrawLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const updated: Driver = {
      ...driver,
      totalEarnings: driver.totalEarnings - amount,
    };
    saveDriver(updated);
    setDriver(updated);
    setWithdrawLoading(false);
    setWithdrawOpen(false);
    setWithdrawAmount("");
    toast.success(
      `Withdrawal request of ₹${amount.toLocaleString("en-IN")} submitted`,
    );
  };

  const handleUpdateVehicle = async () => {
    if (!driver) return;
    setVehicleLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const updated: Driver = {
      ...driver,
      vehicleRC: vehicleRC || driver.vehicleRC,
      vehicleInsurance: vehicleInsurance || driver.vehicleInsurance,
    };
    saveDriver(updated);
    setDriver(updated);
    setVehicleLoading(false);
    setVehicleOpen(false);
    toast.success("Vehicle details updated");
  };

  if (!driver) {
    return (
      <Card className="bg-neutral-900 border-neutral-800 max-w-2xl mx-auto">
        <CardContent className="py-12 text-center">
          <Alert
            className="bg-red-950/50 border-red-900 max-w-md mx-auto"
            data-ocid="driver.error_state"
          >
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-white/90">
              Session error. Please log in again.
            </AlertDescription>
          </Alert>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="mt-4 border-neutral-700 hover:bg-neutral-800 text-white"
          >
            Back to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  const statusColors = {
    Approved: "bg-green-900/30 text-green-400 border-green-700",
    Pending: "bg-yellow-900/30 text-yellow-400 border-yellow-700",
    Rejected: "bg-red-900/30 text-red-400 border-red-700",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header card */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-gold" />
              </div>
              <div>
                <CardTitle className="text-gold text-xl">
                  Welcome, {driver.name}
                </CardTitle>
                <CardDescription className="text-white/60">
                  Driver ID: {driver.id}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-3 py-1 text-sm font-medium border rounded-full ${statusColors[driver.status]}`}
              >
                {driver.status}
              </span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                data-ocid="driver.button"
                className="border-neutral-700 hover:bg-neutral-800 text-white"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Total Trips</p>
                <p className="text-white text-2xl font-bold">
                  {driver.totalTrips}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Total Earnings</p>
                <p className="text-white text-2xl font-bold">
                  ₹{driver.totalEarnings.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">
              Withdraw Earnings
            </CardTitle>
            <CardDescription className="text-white/50 text-sm">
              Request a withdrawal from your earnings
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              onClick={() => setWithdrawOpen(true)}
              data-ocid="driver.primary_button"
              className="w-full bg-gold hover:bg-gold/90 text-black font-semibold h-10 rounded-lg"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Withdraw Request
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">
              Update Vehicle
            </CardTitle>
            <CardDescription className="text-white/50 text-sm">
              Update your RC or Insurance document info
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              onClick={() => {
                setVehicleRC(driver.vehicleRC);
                setVehicleInsurance(driver.vehicleInsurance);
                setVehicleOpen(true);
              }}
              variant="outline"
              data-ocid="driver.secondary_button"
              className="w-full border-neutral-700 hover:bg-neutral-800 text-white h-10"
            >
              <Settings className="w-4 h-4 mr-2" />
              Update Vehicle
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Booking Requests */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white text-base">
            Booking Requests
          </CardTitle>
          <CardDescription className="text-white/50 text-sm">
            Incoming booking assignments from admin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="flex flex-col items-center justify-center py-8 space-y-3"
            data-ocid="driver.empty_state"
          >
            <Package className="w-10 h-10 text-neutral-600" />
            <p className="text-white/40 text-sm text-center">
              No booking requests yet
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent
          className="bg-neutral-900 border-neutral-800 text-white"
          data-ocid="driver.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-gold">Withdraw Request</DialogTitle>
            <DialogDescription className="text-white/60">
              Available balance: ₹{driver.totalEarnings.toLocaleString("en-IN")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="withdraw-amount" className="text-white">
                Amount (₹)
              </Label>
              <Input
                id="withdraw-amount"
                type="number"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min={1}
                max={driver.totalEarnings}
                disabled={withdrawLoading}
                data-ocid="driver.input"
                className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/40 h-11"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setWithdrawOpen(false)}
              disabled={withdrawLoading}
              data-ocid="driver.cancel_button"
              className="border-neutral-700 hover:bg-neutral-800 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={withdrawLoading}
              data-ocid="driver.confirm_button"
              className="bg-gold hover:bg-gold/90 text-black font-semibold"
            >
              {withdrawLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Vehicle Dialog */}
      <Dialog open={vehicleOpen} onOpenChange={setVehicleOpen}>
        <DialogContent
          className="bg-neutral-900 border-neutral-800 text-white"
          data-ocid="driver.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-gold">
              Update Vehicle Details
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Update RC or insurance document reference
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="update-rc" className="text-white">
                Vehicle RC Reference
              </Label>
              <Input
                id="update-rc"
                placeholder="RC document name"
                value={vehicleRC}
                onChange={(e) => setVehicleRC(e.target.value)}
                disabled={vehicleLoading}
                data-ocid="driver.input"
                className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/40 h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="update-insurance" className="text-white">
                Insurance Reference
              </Label>
              <Input
                id="update-insurance"
                placeholder="Insurance document name"
                value={vehicleInsurance}
                onChange={(e) => setVehicleInsurance(e.target.value)}
                disabled={vehicleLoading}
                data-ocid="driver.input"
                className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/40 h-11"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setVehicleOpen(false)}
              disabled={vehicleLoading}
              data-ocid="driver.cancel_button"
              className="border-neutral-700 hover:bg-neutral-800 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateVehicle}
              disabled={vehicleLoading}
              data-ocid="driver.save_button"
              className="bg-gold hover:bg-gold/90 text-black font-semibold"
            >
              {vehicleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
