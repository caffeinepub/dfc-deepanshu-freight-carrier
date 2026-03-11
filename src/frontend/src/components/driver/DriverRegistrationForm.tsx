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
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Truck,
  Upload,
} from "lucide-react";
import { type FormEvent, useRef, useState } from "react";

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

function generateDriverId(): string {
  return `DRV${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

interface FileInputProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  storeAsBase64?: boolean;
}

function FileInputField({
  label,
  id,
  value,
  onChange,
  disabled,
  storeAsBase64,
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const displayValue =
    storeAsBase64 && value?.startsWith("data:") ? "Photo uploaded ✓" : value;

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-white text-sm">
        {label}
      </Label>
      <button
        type="button"
        className="flex items-center gap-2 w-full bg-neutral-950 border border-neutral-700 rounded-md px-3 py-2 cursor-pointer hover:border-gold/50 transition-colors text-left"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        disabled={disabled}
      >
        <Upload className="w-4 h-4 text-gold flex-shrink-0" />
        <span
          className={`text-sm truncate ${displayValue ? "text-white" : "text-white/40"}`}
        >
          {displayValue || `Choose ${label}`}
        </span>
        <input
          ref={inputRef}
          id={id}
          type="file"
          className="hidden"
          disabled={disabled}
          accept="image/*,.pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (storeAsBase64) {
              const reader = new FileReader();
              reader.onload = (evt) => {
                if (evt.target?.result) {
                  onChange(evt.target.result as string);
                }
              };
              reader.readAsDataURL(file);
            } else {
              onChange(file.name);
            }
          }}
        />
      </button>
      {storeAsBase64 && value?.startsWith("data:") && (
        <img
          src={value}
          alt={label}
          className="w-full h-32 object-cover rounded-lg border border-neutral-700 mt-1"
        />
      )}
    </div>
  );
}

export function DriverRegistrationForm() {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    alternateMobile: "",
    address: "",
    emergency1: "",
    emergency2: "",
    emergency3: "",
    aadharCard: "",
    drivingLicence: "",
    vehicleRC: "",
    vehicleInsurance: "",
    vehiclePhoto: "",
    driverPhoto: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [driverId, setDriverId] = useState("");
  const [error, setError] = useState("");

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.mobile.trim() || !form.address.trim()) {
      setError("Please fill in all required personal details.");
      return;
    }
    if (form.mobile.length !== 10) {
      setError("Mobile number must be exactly 10 digits.");
      return;
    }
    if (
      !form.emergency1.trim() ||
      !form.emergency2.trim() ||
      !form.emergency3.trim()
    ) {
      setError("All 3 emergency contacts are required.");
      return;
    }
    if (
      !form.aadharCard ||
      !form.drivingLicence ||
      !form.vehicleRC ||
      !form.vehicleInsurance ||
      !form.vehiclePhoto ||
      !form.driverPhoto
    ) {
      setError("All 6 documents must be uploaded.");
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((r) => setTimeout(r, 600));

      const newId = generateDriverId();
      const driver: Driver = {
        id: newId,
        ...form,
        status: "Pending",
        totalTrips: 0,
        totalEarnings: 0,
        registeredAt: new Date().toISOString(),
      };

      const existing: Driver[] = JSON.parse(
        localStorage.getItem("dfc_drivers") || "[]",
      );
      existing.push(driver);
      localStorage.setItem("dfc_drivers", JSON.stringify(existing));

      setDriverId(newId);
      setSuccess(true);
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="bg-neutral-900 border-neutral-800 max-w-2xl mx-auto">
        <CardContent className="pt-10 pb-10 text-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto" />
          <h3 className="text-gold text-2xl font-bold">
            Registration Submitted!
          </h3>
          <p className="text-white/70 text-base">
            Your application has been submitted for verification.
          </p>
          <div className="bg-neutral-800 border border-neutral-700 rounded-lg px-6 py-4 inline-block">
            <p className="text-white/60 text-sm mb-1">Your Driver ID</p>
            <p className="text-gold font-bold text-xl tracking-widest">
              {driverId}
            </p>
          </div>
          <p className="text-white/50 text-sm">
            Please save your Driver ID. You will need it to log in once
            approved.
          </p>
          <Button
            onClick={() => {
              setSuccess(false);
              setForm({
                name: "",
                mobile: "",
                alternateMobile: "",
                address: "",
                emergency1: "",
                emergency2: "",
                emergency3: "",
                aadharCard: "",
                drivingLicence: "",
                vehicleRC: "",
                vehicleInsurance: "",
                vehiclePhoto: "",
                driverPhoto: "",
              });
              setDriverId("");
            }}
            variant="outline"
            className="border-neutral-700 hover:bg-neutral-800 text-white mt-2"
          >
            Register Another Driver
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-neutral-900 border-neutral-800 max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Truck className="w-6 h-6 text-gold" />
          </div>
          <div>
            <CardTitle className="text-gold text-2xl">
              Driver Registration
            </CardTitle>
            <CardDescription className="text-white/70">
              Complete all sections to apply as a DFC driver
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Details */}
          <div className="space-y-4">
            <h3 className="text-gold font-semibold text-base border-b border-neutral-700 pb-2">
              Personal Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="drv-name" className="text-white">
                  Full Name *
                </Label>
                <Input
                  id="drv-name"
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  required
                  disabled={isLoading}
                  data-ocid="driver.input"
                  className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/40 h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="drv-mobile" className="text-white">
                  Mobile Number *
                </Label>
                <Input
                  id="drv-mobile"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={form.mobile}
                  onChange={(e) =>
                    updateField(
                      "mobile",
                      e.target.value.replace(/\D/g, "").slice(0, 10),
                    )
                  }
                  required
                  maxLength={10}
                  disabled={isLoading}
                  data-ocid="driver.input"
                  className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/40 h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="drv-alt-mobile" className="text-white">
                  Alternate Mobile
                </Label>
                <Input
                  id="drv-alt-mobile"
                  type="tel"
                  placeholder="Alternate mobile number"
                  value={form.alternateMobile}
                  onChange={(e) =>
                    updateField(
                      "alternateMobile",
                      e.target.value.replace(/\D/g, "").slice(0, 10),
                    )
                  }
                  maxLength={10}
                  disabled={isLoading}
                  className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/40 h-11"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="drv-address" className="text-white">
                  Full Address *
                </Label>
                <Input
                  id="drv-address"
                  placeholder="House No., Street, City, State, PIN"
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/40 h-11"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="space-y-4">
            <h3 className="text-gold font-semibold text-base border-b border-neutral-700 pb-2">
              Emergency Contacts *
            </h3>
            <p className="text-white/50 text-sm">
              Required for safety — will only be contacted in emergencies.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="drv-em1" className="text-white">
                  Contact 1
                </Label>
                <Input
                  id="drv-em1"
                  type="tel"
                  placeholder="Mobile number"
                  value={form.emergency1}
                  onChange={(e) =>
                    updateField(
                      "emergency1",
                      e.target.value.replace(/\D/g, "").slice(0, 10),
                    )
                  }
                  required
                  maxLength={10}
                  disabled={isLoading}
                  className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/40 h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="drv-em2" className="text-white">
                  Contact 2
                </Label>
                <Input
                  id="drv-em2"
                  type="tel"
                  placeholder="Mobile number"
                  value={form.emergency2}
                  onChange={(e) =>
                    updateField(
                      "emergency2",
                      e.target.value.replace(/\D/g, "").slice(0, 10),
                    )
                  }
                  required
                  maxLength={10}
                  disabled={isLoading}
                  className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/40 h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="drv-em3" className="text-white">
                  Contact 3
                </Label>
                <Input
                  id="drv-em3"
                  type="tel"
                  placeholder="Mobile number"
                  value={form.emergency3}
                  onChange={(e) =>
                    updateField(
                      "emergency3",
                      e.target.value.replace(/\D/g, "").slice(0, 10),
                    )
                  }
                  required
                  maxLength={10}
                  disabled={isLoading}
                  className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/40 h-11"
                />
              </div>
            </div>
          </div>

          {/* Document Uploads */}
          <div className="space-y-4">
            <h3 className="text-gold font-semibold text-base border-b border-neutral-700 pb-2">
              Document Uploads *
            </h3>
            <p className="text-white/50 text-sm">
              Upload clear photos or PDFs of all required documents.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FileInputField
                label="Aadhar Card"
                id="drv-aadhar"
                value={form.aadharCard}
                onChange={(v) => updateField("aadharCard", v)}
                disabled={isLoading}
              />
              <FileInputField
                label="Driving Licence"
                id="drv-dl"
                value={form.drivingLicence}
                onChange={(v) => updateField("drivingLicence", v)}
                disabled={isLoading}
              />
              <FileInputField
                label="Vehicle RC"
                id="drv-rc"
                value={form.vehicleRC}
                onChange={(v) => updateField("vehicleRC", v)}
                disabled={isLoading}
              />
              <FileInputField
                label="Vehicle Insurance"
                id="drv-insurance"
                value={form.vehicleInsurance}
                onChange={(v) => updateField("vehicleInsurance", v)}
                disabled={isLoading}
              />
              <FileInputField
                label="Vehicle Photo"
                id="drv-vehicle-photo"
                value={form.vehiclePhoto}
                onChange={(v) => updateField("vehiclePhoto", v)}
                disabled={isLoading}
                storeAsBase64
              />
              <FileInputField
                label="Driver Photo"
                id="drv-driver-photo"
                value={form.driverPhoto}
                onChange={(v) => updateField("driverPhoto", v)}
                disabled={isLoading}
                storeAsBase64
              />
            </div>
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
            disabled={isLoading}
            data-ocid="driver.submit_button"
            className="w-full bg-gold hover:bg-gold/90 text-black font-bold text-lg h-12 rounded-lg disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Registration"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
