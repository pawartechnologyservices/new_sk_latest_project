import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { initialAlerts, Alert } from "../data";
import { cn } from "@/lib/utils";

const AlertsSection = () => {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);

  const handleUpdateStatus = (alertId: string, status: Alert["status"]) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status } : alert
    ));
    toast.success("Alert status updated!");
  };

  const getSeverityColor = (severity: Alert["severity"]) => {
    const colors = {
      low: "secondary",
      medium: "default",
      high: "destructive",
      critical: "destructive"
    };
    return colors[severity];
  };

  const getStatusColor = (status: Alert["status"]) => {
    const colors = {
      open: "secondary",
      "in-progress": "default",
      resolved: "outline"
    };
    return colors[status];
  };

  // Mobile card view for alerts
  const MobileAlertCard = ({ alert }: { alert: Alert }) => (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="font-medium">{alert.title}</div>
        <Badge variant={getSeverityColor(alert.severity) as "default" | "destructive" | "outline" | "secondary"}>
          {alert.severity}
        </Badge>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <div className="text-muted-foreground">Status</div>
        <Badge variant={getStatusColor(alert.status) as "default" | "destructive" | "outline" | "secondary"}>
          {alert.status}
        </Badge>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <div className="text-muted-foreground">Date</div>
        <div>{alert.date}</div>
      </div>
      
      <div className="flex flex-wrap gap-2 pt-2">
        {alert.status !== "open" && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleUpdateStatus(alert.id, "open")}
            className="flex-1"
          >
            Reopen
          </Button>
        )}
        {alert.status !== "in-progress" && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleUpdateStatus(alert.id, "in-progress")}
            className="flex-1"
          >
            In Progress
          </Button>
        )}
        {alert.status !== "resolved" && (
          <Button 
            variant="default" 
            size="sm"
            onClick={() => handleUpdateStatus(alert.id, "resolved")}
            className="flex-1"
          >
            Resolve
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Alerts & Issues</CardTitle>
          <Button 
            onClick={() => toast.success("Navigating to detailed alerts page...")}
            className="w-full sm:w-auto"
            size="sm"
          >
            View All Alerts
          </Button>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Alert Title</TableHead>
                  <TableHead className="whitespace-nowrap">Severity</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap">Date</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <div>No alerts found</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  alerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium whitespace-nowrap max-w-[300px] truncate" title={alert.title}>
                        {alert.title}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={getSeverityColor(alert.severity) as "default" | "destructive" | "outline" | "secondary"}>
                          {alert.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={getStatusColor(alert.status) as "default" | "destructive" | "outline" | "secondary"}>
                          {alert.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{alert.date}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2 whitespace-nowrap">
                          {alert.status !== "open" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUpdateStatus(alert.id, "open")}
                              className="h-8 px-2 sm:px-3"
                            >
                              Reopen
                            </Button>
                          )}
                          {alert.status !== "in-progress" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUpdateStatus(alert.id, "in-progress")}
                              className="h-8 px-2 sm:px-3"
                            >
                              In Progress
                            </Button>
                          )}
                          {alert.status !== "resolved" && (
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleUpdateStatus(alert.id, "resolved")}
                              className="h-8 px-2 sm:px-3"
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <div>No alerts found</div>
                </div>
              </div>
            ) : (
              alerts.map((alert) => (
                <MobileAlertCard key={alert.id} alert={alert} />
              ))
            )}
          </div>

          {/* Quick Stats for Alerts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
            <div className="text-center">
              <div className="text-xs sm:text-sm text-muted-foreground">Total</div>
              <div className="text-lg sm:text-xl font-bold">{alerts.length}</div>
            </div>
            <div className="text-center">
              <div className="text-xs sm:text-sm text-muted-foreground">Open</div>
              <div className="text-lg sm:text-xl font-bold text-yellow-600">
                {alerts.filter(a => a.status === "open").length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs sm:text-sm text-muted-foreground">In Progress</div>
              <div className="text-lg sm:text-xl font-bold text-blue-600">
                {alerts.filter(a => a.status === "in-progress").length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs sm:text-sm text-muted-foreground">Resolved</div>
              <div className="text-lg sm:text-xl font-bold text-green-600">
                {alerts.filter(a => a.status === "resolved").length}
              </div>
            </div>
          </div>

          {/* Severity Breakdown */}
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
            <h3 className="text-sm font-medium mb-3">Severity Breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-xs sm:text-sm">Low</span>
                <Badge variant="secondary" className="ml-2">
                  {alerts.filter(a => a.severity === "low").length}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-xs sm:text-sm">Medium</span>
                <Badge variant="default" className="ml-2">
                  {alerts.filter(a => a.severity === "medium").length}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-xs sm:text-sm">High</span>
                <Badge variant="destructive" className="ml-2">
                  {alerts.filter(a => a.severity === "high").length}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-xs sm:text-sm">Critical</span>
                <Badge variant="destructive" className="ml-2">
                  {alerts.filter(a => a.severity === "critical").length}
                </Badge>
              </div>
            </div>
          </div>

          {/* Recent Activity Indicator */}
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
            <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Real-time updates enabled</span>
              </div>
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertsSection;