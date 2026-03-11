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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  Truck,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { useCallback, useState } from "react";
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

function loadDrivers(): Driver[] {
  try {
    return JSON.parse(localStorage.getItem("dfc_drivers") || "[]");
  } catch {
    return [];
  }
}

function saveDrivers(drivers: Driver[]) {
  localStorage.setItem("dfc_drivers", JSON.stringify(drivers));
}

const statusConfig = {
  Pending: {
    label: "Pending",
    className: "bg-yellow-900/30 text-yellow-400 border border-yellow-700",
  },
  Approved: {
    label: "Approved",
    className: "bg-green-900/30 text-green-400 border border-green-700",
  },
  Rejected: {
    label: "Rejected",
    className: "bg-red-900/30 text-red-400 border border-red-700",
  },
};

interface DriverRowProps {
  driver: Driver;
  index: number;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

function DriverPhotoAvatar({
  src,
  size = 40,
}: { src?: string; size?: number }) {
  if (src?.startsWith("data:")) {
    return (
      <img
        src={src}
        alt="Driver"
        style={{ width: size, height: size }}
        className="rounded-full object-cover border-2 border-gold/40 flex-shrink-0"
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-neutral-700 border-2 border-neutral-600 flex items-center justify-center flex-shrink-0"
    >
      <User className="w-5 h-5 text-neutral-400" />
    </div>
  );
}

function DriverRow({ driver, index, onApprove, onReject }: DriverRowProps) {
  const [open, setOpen] = useState(false);
  const cfg = statusConfig[driver.status];

  const markerIndex = index + 1;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className="bg-neutral-800/60 rounded-lg border border-neutral-700 overflow-hidden"
        data-ocid={`drivers.item.${markerIndex}`}
      >
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-neutral-800 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              {open ? (
                <ChevronDown className="w-4 h-4 text-white/40 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-white/40 flex-shrink-0" />
              )}
              {/* Driver photo avatar */}
              <DriverPhotoAvatar src={driver.driverPhoto} />
              <div className="min-w-0">
                <p className="text-white font-medium truncate">{driver.name}</p>
                <p className="text-white/50 text-sm font-mono">
                  {driver.id} · {driver.mobile}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 ml-4 flex-shrink-0">
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${cfg.className}`}
              >
                {cfg.label}
              </span>
              {driver.status === "Pending" && (
                // biome-ignore lint/a11y/useKeyWithClickEvents: stopPropagation wrapper only, not interactive
                <div
                  className="flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="sm"
                    onClick={() => onApprove(driver.id)}
                    data-ocid={`drivers.confirm_button.${markerIndex}`}
                    className="bg-green-700 hover:bg-green-600 text-white h-7 px-2 text-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onReject(driver.id)}
                    data-ocid={`drivers.delete_button.${markerIndex}`}
                    className="bg-red-800 hover:bg-red-700 text-white h-7 px-2 text-xs"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-neutral-700 px-4 py-4 space-y-4 bg-neutral-900/50">
            {/* Personal details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wide mb-1">
                  Address
                </p>
                <p className="text-white/80 text-sm">{driver.address || "—"}</p>
              </div>
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wide mb-1">
                  Alternate Mobile
                </p>
                <p className="text-white/80 text-sm">
                  {driver.alternateMobile || "—"}
                </p>
              </div>
            </div>

            {/* Emergency contacts */}
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wide mb-2">
                Emergency Contacts
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "ec1", value: driver.emergency1 },
                  { label: "ec2", value: driver.emergency2 },
                  { label: "ec3", value: driver.emergency3 },
                ].map((ec) => (
                  <span
                    key={ec.label}
                    className="bg-neutral-800 border border-neutral-700 text-white/70 text-sm px-3 py-1 rounded-full"
                  >
                    {ec.value || "—"}
                  </span>
                ))}
              </div>
            </div>

            {/* Photos section */}
            {(driver.driverPhoto?.startsWith("data:") ||
              driver.vehiclePhoto?.startsWith("data:")) && (
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wide mb-2 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Photos
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {driver.driverPhoto?.startsWith("data:") && (
                    <div className="space-y-1">
                      <p className="text-white/40 text-xs">Driver Photo</p>
                      <img
                        src={driver.driverPhoto}
                        alt="Driver"
                        className="w-full rounded-lg object-cover border border-neutral-700"
                        style={{ maxHeight: 160 }}
                      />
                    </div>
                  )}
                  {driver.vehiclePhoto?.startsWith("data:") && (
                    <div className="space-y-1">
                      <p className="text-white/40 text-xs">Vehicle Photo</p>
                      <img
                        src={driver.vehiclePhoto}
                        alt="Vehicle"
                        className="w-full rounded-lg object-cover border border-neutral-700"
                        style={{ maxHeight: 160 }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documents */}
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wide mb-2 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Uploaded Documents
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: "Aadhar Card", value: driver.aadharCard },
                  { label: "Driving Licence", value: driver.drivingLicence },
                  { label: "Vehicle RC", value: driver.vehicleRC },
                  {
                    label: "Vehicle Insurance",
                    value: driver.vehicleInsurance,
                  },
                ].map((doc) => (
                  <div
                    key={doc.label}
                    className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2"
                  >
                    <p className="text-white/40 text-xs">{doc.label}</p>
                    <p className="text-white/80 text-xs truncate mt-0.5">
                      {doc.value || "—"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-white/30 text-xs">
              Registered:{" "}
              {new Date(driver.registeredAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function AdminDriverVerificationPanel() {
  const [drivers, setDrivers] = useState<Driver[]>(loadDrivers);

  const refresh = useCallback(() => {
    setDrivers(loadDrivers());
  }, []);

  const handleApprove = useCallback((id: string) => {
    const all = loadDrivers();
    const idx = all.findIndex((d) => d.id === id);
    if (idx !== -1) {
      all[idx].status = "Approved";
      saveDrivers(all);
      setDrivers([...all]);
      toast.success(`Driver ${all[idx].name} approved`);
    }
  }, []);

  const handleReject = useCallback((id: string) => {
    const all = loadDrivers();
    const idx = all.findIndex((d) => d.id === id);
    if (idx !== -1) {
      all[idx].status = "Rejected";
      saveDrivers(all);
      setDrivers([...all]);
      toast.error(`Driver ${all[idx].name} rejected`);
    }
  }, []);

  const pending = drivers.filter((d) => d.status === "Pending").length;
  const approved = drivers.filter((d) => d.status === "Approved").length;
  const rejected = drivers.filter((d) => d.status === "Rejected").length;

  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-yellow-900/20 border-yellow-700/40">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-yellow-400 text-2xl font-bold">{pending}</p>
            <p className="text-white/60 text-sm mt-0.5">Pending</p>
          </CardContent>
        </Card>
        <Card className="bg-green-900/20 border-green-700/40">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-green-400 text-2xl font-bold">{approved}</p>
            <p className="text-white/60 text-sm mt-0.5">Approved</p>
          </CardContent>
        </Card>
        <Card className="bg-red-900/20 border-red-700/40">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-red-400 text-2xl font-bold">{rejected}</p>
            <p className="text-white/60 text-sm mt-0.5">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Drivers list */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Truck className="w-4 h-4 text-gold" />
              Driver Applications
            </CardTitle>
            <CardDescription className="text-white/50 text-sm mt-1">
              {drivers.length} total · click a row to expand details
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            className="border-neutral-700 hover:bg-neutral-800 text-white"
          >
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {drivers.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-12 space-y-3"
              data-ocid="drivers.empty_state"
            >
              <Users className="w-10 h-10 text-neutral-600" />
              <p className="text-white/40 text-sm">
                No driver applications yet
              </p>
            </div>
          ) : (
            <div className="space-y-2" data-ocid="drivers.list">
              {drivers.map((driver, i) => (
                <DriverRow
                  key={driver.id}
                  driver={driver}
                  index={i}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
