import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { useAdminSession } from "../../hooks/useAdminSession";
import type { Client } from "../../lib/types";
import { scrollToSection } from "../../utils/scrollToSection";
import { AdminTrackingPanel } from "../AdminTrackingPanel";
import { AdminClientDetail } from "./AdminClientDetail";
import { AdminClientProvisionDialog } from "./AdminClientProvisionDialog";
import { AdminClientsTable } from "./AdminClientsTable";
import { AdminDriverVerificationPanel } from "./AdminDriverVerificationPanel";
import { AdminGoogleGeocodingPanel } from "./AdminGoogleGeocodingPanel";
import { AdminInvoiceExportButton } from "./AdminInvoiceExportButton";
import { AdminLoginHistoryPanel } from "./AdminLoginHistoryPanel";
import { AdminMsg91Panel } from "./AdminMsg91Panel";
import { AdminRevenuePanel } from "./AdminRevenuePanel";

export function AdminDashboard() {
  const { logout } = useAdminSession();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState("clients");

  const handleLogout = async () => {
    await logout();
    scrollToSection("home");
  };

  return (
    <Card className="bg-[#0a0a0a] border border-[#1a1a1a] overflow-hidden">
      {/* Gold gradient accent line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#C9A227] to-transparent" />
      <CardHeader className="bg-gradient-to-b from-[#0f0f0f] to-[#080808]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <img
              src="/assets/uploads/IMG_20260302_164631-1.png"
              alt="DFC"
              className="h-10 w-auto object-contain"
            />
            <div>
              <CardTitle className="text-[#C9A227] text-2xl font-bold tracking-wide">
                Admin Dashboard
              </CardTitle>
              <CardDescription className="text-white/70 text-base">
                Manage clients, shipments, invoices, and system configuration
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-nowrap overflow-x-auto">
            <AdminClientProvisionDialog />
            <AdminInvoiceExportButton />
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-neutral-700 hover:bg-neutral-800 text-white whitespace-nowrap"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 bg-[#111111] border border-[#222] rounded-xl mb-6">
            <TabsTrigger
              value="clients"
              className="data-[state=active]:bg-[#C9A227] data-[state=active]:text-black text-xs sm:text-sm"
            >
              Clients
            </TabsTrigger>
            <TabsTrigger
              value="tracking"
              className="data-[state=active]:bg-[#C9A227] data-[state=active]:text-black text-xs sm:text-sm"
            >
              Tracking
            </TabsTrigger>
            <TabsTrigger
              value="revenue"
              className="data-[state=active]:bg-[#C9A227] data-[state=active]:text-black text-xs sm:text-sm"
            >
              Revenue
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-[#C9A227] data-[state=active]:text-black text-xs sm:text-sm"
            >
              History
            </TabsTrigger>
            <TabsTrigger
              value="drivers"
              className="data-[state=active]:bg-[#C9A227] data-[state=active]:text-black text-xs sm:text-sm"
            >
              Drivers
            </TabsTrigger>
            <TabsTrigger
              value="config"
              className="data-[state=active]:bg-[#C9A227] data-[state=active]:text-black text-xs sm:text-sm"
            >
              Config
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="space-y-4">
            {selectedClient ? (
              <AdminClientDetail
                client={selectedClient}
                onBack={() => setSelectedClient(null)}
              />
            ) : (
              <AdminClientsTable onSelectClient={setSelectedClient} />
            )}
          </TabsContent>

          <TabsContent value="tracking">
            <AdminTrackingPanel enabled={activeTab === "tracking"} />
          </TabsContent>

          <TabsContent value="revenue">
            <AdminRevenuePanel />
          </TabsContent>

          <TabsContent value="history">
            <AdminLoginHistoryPanel />
          </TabsContent>

          <TabsContent value="drivers">
            <AdminDriverVerificationPanel />
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <AdminMsg91Panel />
            <AdminGoogleGeocodingPanel />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
