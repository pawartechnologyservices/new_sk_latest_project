import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Alert } from "@/types/alert";
import { alertService } from "@/services/alertService";
import { workQueryApi } from "../../../services/workQueryApi";
import { Plus, Eye, Camera, X, Image as ImageIcon, Calendar, Clock, Loader2, Wifi, WifiOff, RefreshCw, MessageCircle, AlertCircle, CheckCircle, FileText, User, Filter, ChevronDown, ChevronUp, MoreVertical } from "lucide-react";
import { useRole } from "@/context/RoleContext";

// Types for Work Queries
interface WorkQuery {
  _id: string;
  queryId: string;
  title: string;
  description: string;
  serviceId?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  category: string;
  proofFiles: Array<{
    name: string;
    type: string;
    url: string;
    size: string;
  }>;
  reportedBy: {
    userId: string;
    name: string;
    role: string;
  };
  supervisorId: string;
  supervisorName: string;
  superadminResponse?: string;
  createdAt: string;
  updatedAt: string;
}

// Mobile responsive alert card
const MobileAlertCard = ({ 
  alert, 
  onView, 
  onUpdateStatus, 
  submitting,
  getSeverityColor,
  formatDateTime 
}: { 
  alert: Alert; 
  onView: (alert: Alert) => void;
  onUpdateStatus: (id: string, status: Alert["status"]) => void;
  submitting: boolean;
  getSeverityColor: (severity: Alert["severity"]) => string;
  formatDateTime: (dateTimeString: string) => JSX.Element;
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="mb-3 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold">{alert.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">Site: {alert.site}</p>
          </div>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(alert)}>
                  <Eye className="h-4 w-4 mr-2" /> View
                </DropdownMenuItem>
                {alert.status !== "open" && (
                  <DropdownMenuItem onClick={() => onUpdateStatus(alert.id, "open")}>
                    <CheckCircle className="h-4 w-4 mr-2" /> Reopen
                  </DropdownMenuItem>
                )}
                {alert.status !== "in-progress" && (
                  <DropdownMenuItem onClick={() => onUpdateStatus(alert.id, "in-progress")}>
                    <Clock className="h-4 w-4 mr-2" /> In Progress
                  </DropdownMenuItem>
                )}
                {alert.status !== "resolved" && (
                  <DropdownMenuItem onClick={() => onUpdateStatus(alert.id, "resolved")}>
                    <CheckCircle className="h-4 w-4 mr-2" /> Resolve
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Badge className={getSeverityColor(alert.severity)}>
            {alert.severity}
          </Badge>
          <Badge variant={
            alert.status === "resolved" ? "default" : 
            alert.status === "in-progress" ? "secondary" : "outline"
          } className="capitalize">
            {alert.status}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs">{formatDateTime(alert.date)}</span>
          {alert.photos && alert.photos.length > 0 && (
            <>
              <span>•</span>
              <ImageIcon className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs">{alert.photos.length}</span>
            </>
          )}
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Reported By</p>
              <p className="text-sm">{alert.reportedBy}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Assigned To</p>
              <p className="text-sm">{alert.assignedTo || 'Unassigned'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Description</p>
              <p className="text-sm">{alert.description}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Mobile responsive work query card
const MobileWorkQueryCard = ({ 
  query, 
  onView,
  getPriorityBadge,
  getStatusBadge,
  formatDate 
}: { 
  query: WorkQuery; 
  onView: (query: WorkQuery) => void;
  getPriorityBadge: (priority: WorkQuery["priority"]) => JSX.Element;
  getStatusBadge: (status: WorkQuery["status"]) => JSX.Element;
  formatDate: (date: string) => string;
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="mb-3 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs font-mono text-muted-foreground">{query.queryId}</p>
            <h3 className="font-semibold mt-1">{query.title}</h3>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onView(query)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          {getPriorityBadge(query.priority)}
          {getStatusBadge(query.status)}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs">{formatDate(query.createdAt)}</span>
          {query.proofFiles && query.proofFiles.length > 0 && (
            <>
              <span>•</span>
              <FileText className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs">{query.proofFiles.length}</span>
            </>
          )}
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Description</p>
              <p className="text-sm">{query.description.substring(0, 100)}...</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Service</p>
              <p className="text-sm">{query.serviceId || 'N/A'} • {query.category}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reported By</p>
              <p className="text-sm">{query.reportedBy?.name} ({query.reportedBy?.role})</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AlertsSection = () => {
  const [activeTab, setActiveTab] = useState<string>("alerts");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [workQueries, setWorkQueries] = useState<WorkQuery[]>([]);
  const [loading, setLoading] = useState({ alerts: false, queries: false });
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [selectedAlertForEdit, setSelectedAlertForEdit] = useState<Alert & { date: string; time: string } | null>(null);
  const [selectedWorkQuery, setSelectedWorkQuery] = useState<WorkQuery | null>(null);
  const [workQueryDialogOpen, setWorkQueryDialogOpen] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [editPhotoFiles, setEditPhotoFiles] = useState<File[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  
  // Mobile responsive state
  const [isMobileView, setIsMobileView] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const { user: authUser } = useRole();

  // Check for mobile view on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    checkConnectionAndFetch();
  }, []);

  useEffect(() => {
    if (activeTab === "work-queries" && authUser?.id) {
      fetchWorkQueries();
    }
  }, [activeTab, authUser?.id]);

  const checkConnectionAndFetch = async () => {
    try {
      setConnectionStatus("checking");
      await alertService.testConnection();
      setConnectionStatus("connected");
      await fetchAlerts();
    } catch (error) {
      setConnectionStatus("disconnected");
      console.error('Connection check failed');
    }
  };

  const fetchAlerts = async () => {
    try {
      setLoading(prev => ({ ...prev, alerts: true }));
      console.log('Fetching alerts...');
      const response = await alertService.getAlerts();
      setAlerts(response.data);
      if (response.total > 0) {
        toast.success(`Loaded ${response.total} alerts`);
      }
    } catch (error: any) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to load alerts. Please check API connection.');
      setAlerts([]);
    } finally {
      setLoading(prev => ({ ...prev, alerts: false }));
    }
  };

  const fetchWorkQueries = async () => {
    if (!authUser?.id) {
      console.log('⚠️ No authenticated user found. Trying to fetch all queries...');
    }

    try {
      setLoading(prev => ({ ...prev, queries: true }));
      
      console.group('🔍 WORK QUERIES FETCH DEBUG');
      console.log('Current auth user:', authUser);
      console.log('User ID:', authUser?.id);
      console.log('User role:', authUser?.role);
      console.groupEnd();

      // STRATEGY: Try multiple approaches
      let response;
      
      // Approach 1: Try with current user's ID (for supervisor)
      if (authUser?.id) {
        console.log(`🔄 Attempt 1: Fetching for supervisorId: ${authUser.id}`);
        response = await workQueryApi.getAllWorkQueries({
          supervisorId: authUser.id,
          limit: 100
        });
      }
      
      // Approach 2: If empty, try without supervisor filter
      if (!response || response.data?.length === 0) {
        console.log('🔄 Attempt 2: Fetching ALL work queries (no filter)');
        response = await workQueryApi.getAllWorkQueries({
          limit: 100
        });
      }
      
      // Approach 3: Try with a fallback supervisor ID
      if (!response || response.data?.length === 0) {
        const fallbackIds = ['SUP001', 'SUP002', 'supervisor1', 'supervisor'];
        for (const id of fallbackIds) {
          console.log(`🔄 Attempt 3: Trying fallback supervisorId: ${id}`);
          try {
            response = await workQueryApi.getAllWorkQueries({
              supervisorId: id,
              limit: 50
            });
            if (response.data?.length > 0) {
              console.log(`✅ Found ${response.data.length} queries with ID: ${id}`);
              break;
            }
          } catch (e) {
            continue; // Try next ID
          }
        }
      }

      console.log('📊 Final API Response:', response);
      
      if (response && response.success) {
        const queryCount = response.data?.length || 0;
        setWorkQueries(response.data || []);
        
        if (queryCount > 0) {
          toast.success(`Loaded ${queryCount} work queries`);
        } else {
          toast.info('No work queries found in the system');
          console.log('💡 Tip: Create some test work queries first');
        }
      } else {
        toast.error("Failed to load work queries");
        setWorkQueries([]);
      }
    } catch (error: any) {
      console.error('❌ Error fetching work queries:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // User-friendly error messages
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else if (error.response?.status === 404) {
        toast.error('API endpoint not found. Check backend server.');
      } else if (error.code === 'NETWORK_ERROR') {
        toast.error('Network error. Check if backend is running.');
      } else {
        toast.error('Failed to load work queries. Please check API connection.');
      }
      
      setWorkQueries([]);
    } finally {
      setLoading(prev => ({ ...prev, queries: false }));
    }
  };

  const handleUpdateStatus = async (alertId: string, status: Alert["status"]) => {
    try {
      const updatedAlert = await alertService.updateAlertStatus(alertId, status);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? updatedAlert : alert
      ));
      toast.success("Alert status updated!");
    } catch (error: any) {
      console.error('Error updating alert status:', error);
      toast.error(error.message || 'Failed to update alert status');
    }
  };

  const handleViewAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    const [date = "", time = ""] = alert.date.split(' ');
    setSelectedAlertForEdit({
      ...alert,
      date,
      time: time || "00:00"
    });
    setViewDialogOpen(true);
  };

  const handleViewWorkQuery = (query: WorkQuery) => {
    setSelectedWorkQuery(query);
    setWorkQueryDialogOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, 5 - photoFiles.length);
      setPhotoFiles(prev => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEditPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, 5 - editPhotoFiles.length);
      setEditPhotoFiles(prev => [...prev, ...newFiles]);
    }
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveEditPhoto = (index: number) => {
    setEditPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddAlert = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      
      // Get form values
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const severity = formData.get("severity") as Alert["severity"];
      const site = formData.get("site") as string;
      const reportedBy = formData.get("reportedBy") as string;
      const assignedTo = formData.get("assignedTo") as string;
      const date = formData.get("date") as string;
      const time = formData.get("time") as string;
      
      // Validate required fields
      if (!title || !description || !severity || !site || !reportedBy || !date || !time) {
        toast.error('Please fill all required fields');
        setSubmitting(false);
        return;
      }
      
      // Convert photo files to base64 strings
      const photoUrls: string[] = [];
      for (const file of photoFiles) {
        try {
          const base64 = await alertService.fileToBase64(file);
          photoUrls.push(base64);
        } catch (error) {
          console.error('Error converting file to base64:', error);
          toast.error('Error converting some photos');
        }
      }
      
      const newAlertData = {
        title,
        description,
        severity,
        site,
        reportedBy,
        assignedTo: assignedTo || "",
        date: `${date} ${time}`,
        photos: photoUrls
      };

      console.log('Creating alert with data:', newAlertData);
      const newAlert = await alertService.createAlert(newAlertData);
      
      setAlerts(prev => [newAlert, ...prev]);
      toast.success("Alert created successfully!");
      
      setDialogOpen(false);
      setPhotoFiles([]);
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error('Error creating alert:', error);
      toast.error(error.message || 'Failed to create alert. Check console for details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateAlert = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAlertForEdit) return;
    
    setSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Convert new photo files to base64 strings
      const newPhotoUrls: string[] = [];
      for (const file of editPhotoFiles) {
        try {
          const base64 = await alertService.fileToBase64(file);
          newPhotoUrls.push(base64);
        } catch (error) {
          console.error('Error converting file to base64:', error);
          toast.error('Error converting some photos');
        }
      }

      const date = formData.get("editDate") as string;
      const time = formData.get("editTime") as string;
      
      const updateData = {
        title: formData.get("editTitle") as string,
        description: formData.get("editDescription") as string,
        severity: formData.get("editSeverity") as Alert["severity"],
        status: formData.get("editStatus") as Alert["status"],
        site: formData.get("editSite") as string,
        reportedBy: formData.get("editReportedBy") as string,
        assignedTo: formData.get("editAssignedTo") as string,
        date: `${date} ${time}`,
        photos: [...(selectedAlertForEdit.photos || []), ...newPhotoUrls].slice(0, 5) // Max 5 photos
      };

      const updatedAlert = await alertService.updateAlert(selectedAlertForEdit.id, updateData);
      
      setAlerts(prev => prev.map(alert => 
        alert.id === selectedAlertForEdit.id ? updatedAlert : alert
      ));
      
      toast.success("Alert updated successfully!");
      setViewDialogOpen(false);
      setSelectedAlert(null);
      setSelectedAlertForEdit(null);
      setEditPhotoFiles([]);
    } catch (error: any) {
      console.error('Error updating alert:', error);
      toast.error(error.message || 'Failed to update alert');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm("Are you sure you want to delete this alert?")) return;
    
    try {
      await alertService.deleteAlert(alertId);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      toast.success("Alert deleted successfully!");
      setViewDialogOpen(false);
    } catch (error: any) {
      console.error('Error deleting alert:', error);
      toast.error('Failed to delete alert');
    }
  };

  const getSeverityColor = (severity: Alert["severity"]) => {
    const colors = {
      low: "bg-green-100 text-green-800 hover:bg-green-100",
      medium: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      high: "bg-orange-100 text-orange-800 hover:bg-orange-100",
      critical: "bg-red-100 text-red-800 hover:bg-red-100"
    };
    return colors[severity];
  };

  const getPriorityBadge = (priority: WorkQuery["priority"]) => {
    const styles = {
      low: "bg-green-100 text-green-800 border-green-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      critical: "bg-red-100 text-red-800 border-red-200"
    };

    const icons = {
      low: <CheckCircle className="h-3 w-3" />,
      medium: <Clock className="h-3 w-3" />,
      high: <AlertCircle className="h-3 w-3" />,
      critical: <AlertCircle className="h-3 w-3" />
    };

    return (
      <Badge variant="outline" className={`${styles[priority]} flex items-center gap-1 text-xs`}>
        {icons[priority]}
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: WorkQuery["status"]) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      "in-progress": "bg-blue-100 text-blue-800 border-blue-200",
      resolved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200"
    };

    const icons = {
      pending: <Clock className="h-3 w-3" />,
      "in-progress": <AlertCircle className="h-3 w-3" />,
      resolved: <CheckCircle className="h-3 w-3" />,
      rejected: <X className="h-3 w-3" />
    };

    return (
      <Badge variant="outline" className={`${styles[status]} flex items-center gap-1 text-xs`}>
        {icons[status]}
        {status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </Badge>
    );
  };

  const formatDateTime = (dateTimeString: string) => {
    const [date, time] = dateTimeString.split(' ');
    return (
      <div className="space-y-1">
        <div className="font-medium text-sm">{date}</div>
        <div className="text-xs text-muted-foreground">{time || 'No time specified'}</div>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const handleTestConnection = async () => {
    try {
      toast.info('Testing connection...');
      await checkConnectionAndFetch();
      if (connectionStatus === "connected") {
        toast.success('API connection successful!');
      }
    } catch (error) {
      toast.error('Connection failed. Check backend server.');
    }
  };

  const handleRefresh = () => {
    if (activeTab === "alerts") {
      fetchAlerts();
      toast.info("Refreshing alerts...");
    } else if (activeTab === "work-queries") {
      fetchWorkQueries();
      toast.info("Refreshing work queries...");
    }
  };

  const renderAlertsTab = () => (
    <>
      {alerts.length === 0 ? (
        <div className="text-center py-8 md:py-12 border rounded-lg">
          <div className="text-muted-foreground mb-4">
            <ImageIcon className="h-12 w-12 md:h-16 md:w-16 mx-auto opacity-20" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No alerts found</h3>
          <p className="text-sm md:text-base text-muted-foreground mb-4 px-4">
            {connectionStatus === "disconnected" 
              ? "Cannot connect to server. Please check if backend is running."
              : "Create your first alert to get started"}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center px-4">
            <Button
              variant="outline"
              size={isMobileView ? "sm" : "default"}
              onClick={handleTestConnection}
              disabled={connectionStatus === "checking"}
              className="w-full sm:w-auto"
            >
              {connectionStatus === "checking" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wifi className="mr-2 h-4 w-4" />
              )}
              Test Connection
            </Button>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  disabled={connectionStatus === "disconnected"}
                  className="w-full sm:w-auto"
                  size={isMobileView ? "sm" : "default"}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Alert
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>
      ) : isMobileView ? (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <MobileAlertCard
              key={alert.id}
              alert={alert}
              onView={handleViewAlert}
              onUpdateStatus={handleUpdateStatus}
              submitting={submitting}
              getSeverityColor={getSeverityColor}
              formatDateTime={formatDateTime}
            />
          ))}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px] whitespace-nowrap">Alert Title</TableHead>
                  <TableHead className="w-[100px] whitespace-nowrap">Severity</TableHead>
                  <TableHead className="w-[120px] whitespace-nowrap">Status</TableHead>
                  <TableHead className="w-[150px] whitespace-nowrap">Date & Time</TableHead>
                  <TableHead className="w-[120px] whitespace-nowrap">Photos</TableHead>
                  <TableHead className="w-[200px] text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <div className="font-semibold">{alert.title}</div>
                        <div className="text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <span className="font-medium">Site:</span> {alert.site}
                          </span>
                          <span className="mx-2">•</span>
                          <span className="inline-flex items-center gap-1">
                            <span className="font-medium">By:</span> {alert.reportedBy}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getSeverityColor(alert.severity)} capitalize`}>
                        {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        alert.status === "resolved" ? "default" : 
                        alert.status === "in-progress" ? "secondary" : "outline"
                      } className="capitalize">
                        {alert.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateTime(alert.date)}</TableCell>
                    <TableCell>
                      {alert.photos && alert.photos.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <ImageIcon className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{alert.photos.length}</span>
                          <span className="text-xs text-muted-foreground">photo{alert.photos.length !== 1 ? 's' : ''}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No photos</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewAlert(alert)}
                          disabled={submitting}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        {alert.status !== "open" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUpdateStatus(alert.id, "open")}
                            disabled={submitting}
                          >
                            Reopen
                          </Button>
                        )}
                        {alert.status !== "in-progress" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUpdateStatus(alert.id, "in-progress")}
                            disabled={submitting}
                          >
                            In Progress
                          </Button>
                        )}
                        {alert.status !== "resolved" && (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleUpdateStatus(alert.id, "resolved")}
                            disabled={submitting}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </>
  );

  const renderWorkQueriesTab = () => (
    <>
      {workQueries.length === 0 ? (
        <div className="text-center py-8 md:py-12 border rounded-lg">
          <div className="text-muted-foreground mb-4">
            <MessageCircle className="h-12 w-12 md:h-16 md:w-16 mx-auto opacity-20" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No work queries found</h3>
          <p className="text-sm md:text-base text-muted-foreground mb-4 px-4">
            {loading.queries 
              ? "Loading work queries..." 
              : "No work queries have been created yet"}
          </p>
          {!loading.queries && (
            <Button 
              onClick={fetchWorkQueries}
              size={isMobileView ? "sm" : "default"}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          )}
        </div>
      ) : isMobileView ? (
        <div className="space-y-3">
          {workQueries.map((query) => (
            <MobileWorkQueryCard
              key={query._id}
              query={query}
              onView={handleViewWorkQuery}
              getPriorityBadge={getPriorityBadge}
              getStatusBadge={getStatusBadge}
              formatDate={formatDate}
            />
          ))}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px] whitespace-nowrap">Query ID</TableHead>
                  <TableHead className="w-[250px] whitespace-nowrap">Title</TableHead>
                  <TableHead className="w-[150px] whitespace-nowrap">Service</TableHead>
                  <TableHead className="w-[100px] whitespace-nowrap">Priority</TableHead>
                  <TableHead className="w-[120px] whitespace-nowrap">Status</TableHead>
                  <TableHead className="w-[150px] whitespace-nowrap">Reported By</TableHead>
                  <TableHead className="w-[150px] whitespace-nowrap">Created</TableHead>
                  <TableHead className="w-[100px] text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workQueries.map((query) => (
                  <TableRow key={query._id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm font-medium whitespace-nowrap">
                      {query.queryId}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-semibold">{query.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[240px]">
                          {query.description.substring(0, 60)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{query.serviceId || "N/A"}</div>
                      {query.serviceId && (
                        <div className="text-xs text-muted-foreground">
                          {query.category}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {getPriorityBadge(query.priority)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(query.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-sm">{query.reportedBy?.name}</div>
                          <div className="text-xs text-muted-foreground capitalize">{query.reportedBy?.role}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm whitespace-nowrap">{formatDate(query.createdAt)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewWorkQuery(query)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </>
  );

  if (loading.alerts && alerts.length === 0 && activeTab === "alerts") {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Alerts & Issues</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-64">
            <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
            <span className="ml-2 text-sm md:text-base">Loading alerts...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl md:text-2xl">Alerts & Issues</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                  connectionStatus === "connected" 
                    ? "bg-green-100 text-green-800" 
                    : connectionStatus === "disconnected"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {connectionStatus === "connected" ? (
                    <>
                      <Wifi className="h-3 w-3" />
                      Connected
                    </>
                  ) : connectionStatus === "disconnected" ? (
                    <>
                      <WifiOff className="h-3 w-3" />
                      Disconnected
                    </>
                  ) : (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Checking...
                    </>
                  )}
                </div>
                <span className="text-xs md:text-sm text-muted-foreground">
                  {activeTab === "alerts" 
                    ? `${alerts.length} alert${alerts.length !== 1 ? 's' : ''}`
                    : `${workQueries.length} work quer${workQueries.length !== 1 ? 'ies' : 'y'}`
                  }
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size={isMobileView ? "sm" : "default"}
                onClick={handleTestConnection}
                disabled={loading.alerts || connectionStatus === "checking"}
                className="gap-1"
              >
                {connectionStatus === "checking" ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                {!isMobileView && "Test Connection"}
              </Button>
              
              {activeTab === "alerts" && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size={isMobileView ? "sm" : "default"}>
                      <Plus className="mr-2 h-4 w-4" />
                      {!isMobileView && "Create Alert"}
                      {isMobileView && "Create"}
                    </Button>
                  </DialogTrigger>
                </Dialog>
              )}
              
              {activeTab === "work-queries" && authUser?.id && (
                <Button 
                  variant="outline"
                  size={isMobileView ? "sm" : "default"}
                  onClick={() => window.open('/work-queries', '_blank')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {!isMobileView && "New Work Query"}
                  {isMobileView && "New"}
                </Button>
              )}

              <Button 
                variant="outline" 
                size={isMobileView ? "sm" : "default"}
                onClick={handleRefresh}
                disabled={loading.alerts || loading.queries || connectionStatus === "checking"}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading.alerts || loading.queries ? 'animate-spin' : ''}`} />
                {!isMobileView && "Refresh"}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 md:p-6 pt-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="alerts" className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Alerts</span>
                <span className="sm:hidden">Alert</span>
                {alerts.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 flex items-center justify-center">
                    {alerts.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="work-queries" className="flex items-center gap-2 text-sm">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Work Queries</span>
                <span className="sm:hidden">Queries</span>
                {workQueries.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 flex items-center justify-center">
                    {workQueries.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="alerts" className="space-y-4">
              {loading.alerts ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
                  <span className="ml-2 text-sm md:text-base">Loading alerts...</span>
                </div>
              ) : (
                renderAlertsTab()
              )}
            </TabsContent>
            
            <TabsContent value="work-queries" className="space-y-4">
              {loading.queries ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
                  <span className="ml-2 text-sm md:text-base">Loading work queries...</span>
                </div>
              ) : (
                renderWorkQueriesTab()
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* View/Edit Alert Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">
              {selectedAlert ? `Alert Details: ${selectedAlert.title}` : 'Alert Details'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedAlertForEdit && (
            <form onSubmit={handleUpdateAlert} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-3 md:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="editTitle" className="text-sm md:text-base">
                      Alert Title <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="editTitle" 
                      name="editTitle" 
                      defaultValue={selectedAlertForEdit.title}
                      required 
                      disabled={submitting}
                      className="h-9 md:h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editDescription" className="text-sm md:text-base">
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea 
                      id="editDescription" 
                      name="editDescription" 
                      defaultValue={selectedAlertForEdit.description}
                      rows={isMobileView ? 4 : 6}
                      required 
                      disabled={submitting}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editSeverity" className="text-sm md:text-base">
                        Severity <span className="text-red-500">*</span>
                      </Label>
                      <select
                        id="editSeverity"
                        name="editSeverity"
                        className="flex h-9 md:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue={selectedAlertForEdit.severity}
                        required
                        disabled={submitting}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="editStatus" className="text-sm md:text-base">
                        Status <span className="text-red-500">*</span>
                      </Label>
                      <select
                        id="editStatus"
                        name="editStatus"
                        className="flex h-9 md:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue={selectedAlertForEdit.status}
                        required
                        disabled={submitting}
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Right Column - Additional Info & Photos */}
                <div className="space-y-3 md:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editSite" className="text-sm md:text-base">
                        Site <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        id="editSite" 
                        name="editSite" 
                        defaultValue={selectedAlertForEdit.site}
                        required 
                        disabled={submitting}
                        className="h-9 md:h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="editReportedBy" className="text-sm md:text-base">
                        Reported By <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        id="editReportedBy" 
                        name="editReportedBy" 
                        defaultValue={selectedAlertForEdit.reportedBy}
                        required 
                        disabled={submitting}
                        className="h-9 md:h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editAssignedTo" className="text-sm md:text-base">Assigned To</Label>
                      <Input 
                        id="editAssignedTo" 
                        name="editAssignedTo" 
                        defaultValue={selectedAlertForEdit.assignedTo || ""}
                        disabled={submitting}
                        className="h-9 md:h-10"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="editDate" className="text-sm md:text-base">
                          Date <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                          id="editDate" 
                          name="editDate" 
                          type="date"
                          defaultValue={selectedAlertForEdit.date}
                          required 
                          disabled={submitting}
                          className="h-9 md:h-10"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="editTime" className="text-sm md:text-base">
                          Time <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                          id="editTime" 
                          name="editTime" 
                          type="time"
                          defaultValue={selectedAlertForEdit.time}
                          required 
                          disabled={submitting}
                          className="h-9 md:h-10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Photos Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm md:text-base">Photos (Max 5 total)</Label>
                      <span className="text-xs md:text-sm text-muted-foreground">
                        {selectedAlertForEdit.photos?.length || 0 + editPhotoFiles.length}/5
                      </span>
                    </div>
                    
                    {/* Add More Photos */}
                    <div className="border-2 border-dashed rounded-lg p-3 text-center">
                      <Input
                        type="file"
                        ref={editFileInputRef}
                        onChange={handleEditPhotoUpload}
                        accept="image/*"
                        multiple
                        className="hidden"
                        disabled={submitting || 
                          ((selectedAlertForEdit.photos?.length || 0) + editPhotoFiles.length >= 5)
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => editFileInputRef.current?.click()}
                        className="w-full h-9 md:h-10"
                        disabled={submitting || 
                          ((selectedAlertForEdit.photos?.length || 0) + editPhotoFiles.length >= 5)
                        }
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Add more photos
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports JPG, PNG up to 5MB each
                      </p>
                    </div>

                    {/* New Photos Preview */}
                    {editPhotoFiles.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">New Photos to Upload:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {editPhotoFiles.map((file, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-square border rounded-md overflow-hidden">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`New upload ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemoveEditPhoto(index)}
                                disabled={submitting}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                              <p className="text-xs truncate mt-1">{file.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Existing Photos */}
                    {selectedAlertForEdit.photos && selectedAlertForEdit.photos.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Existing Photos:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {selectedAlertForEdit.photos.map((photo, index) => (
                            <div key={index} className="border rounded-md overflow-hidden">
                              <img
                                src={photo}
                                alt={`Existing photo ${index + 1}`}
                                className="w-full h-20 sm:h-24 object-cover"
                              />
                              <div className="p-1 text-xs text-center truncate bg-muted">
                                Photo {index + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline"
                  className="flex-1 h-9 md:h-10"
                  onClick={() => {
                    setViewDialogOpen(false);
                    setSelectedAlert(null);
                    setSelectedAlertForEdit(null);
                    setEditPhotoFiles([]);
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  variant="destructive"
                  className="flex-1 h-9 md:h-10"
                  onClick={() => handleDeleteAlert(selectedAlertForEdit.id)}
                  disabled={submitting}
                >
                  Delete Alert
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 h-9 md:h-10"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Alert'
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Work Query Dialog */}
      <Dialog open={workQueryDialogOpen} onOpenChange={setWorkQueryDialogOpen}>
        <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">
              {selectedWorkQuery ? `Work Query: ${selectedWorkQuery.queryId}` : 'Work Query Details'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedWorkQuery && (
            <div className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <Label className="text-xs md:text-sm font-semibold">Query ID</Label>
                  <p className="mt-1 font-mono text-sm md:text-base">{selectedWorkQuery.queryId}</p>
                </div>
                <div>
                  <Label className="text-xs md:text-sm font-semibold">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedWorkQuery.status)}
                  </div>
                </div>
                <div>
                  <Label className="text-xs md:text-sm font-semibold">Priority</Label>
                  <div className="mt-1">
                    {getPriorityBadge(selectedWorkQuery.priority)}
                  </div>
                </div>
                <div>
                  <Label className="text-xs md:text-sm font-semibold">Category</Label>
                  <p className="mt-1 text-sm md:text-base capitalize">{selectedWorkQuery.category.replace('-', ' ')}</p>
                </div>
                <div>
                  <Label className="text-xs md:text-sm font-semibold">Service ID</Label>
                  <p className="mt-1 text-sm md:text-base">{selectedWorkQuery.serviceId || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-xs md:text-sm font-semibold">Created</Label>
                  <p className="mt-1 text-sm md:text-base">{formatDate(selectedWorkQuery.createdAt)}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs md:text-sm font-semibold">Title</Label>
                <p className="mt-1 text-sm md:text-base font-medium">{selectedWorkQuery.title}</p>
              </div>

              <div>
                <Label className="text-xs md:text-sm font-semibold">Description</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm whitespace-pre-wrap">{selectedWorkQuery.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Label className="text-xs md:text-sm font-semibold text-blue-900">Reported By</Label>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="font-medium text-sm">{selectedWorkQuery.reportedBy?.name}</div>
                        <div className="text-xs text-blue-700 capitalize">{selectedWorkQuery.reportedBy?.role}</div>
                      </div>
                    </div>
                    <div className="text-xs text-blue-600">
                      Supervisor: {selectedWorkQuery.supervisorName}
                    </div>
                  </div>
                </div>

                {selectedWorkQuery.proofFiles && selectedWorkQuery.proofFiles.length > 0 && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <Label className="text-xs md:text-sm font-semibold text-green-900">Supporting Evidence</Label>
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-sm">{selectedWorkQuery.proofFiles.length} file(s)</span>
                      </div>
                      <div className="mt-2 space-y-1">
                        {selectedWorkQuery.proofFiles.slice(0, 3).map((file, index) => (
                          <div key={index} className="text-xs text-green-700 truncate">
                            • {file.name} ({file.size})
                          </div>
                        ))}
                        {selectedWorkQuery.proofFiles.length > 3 && (
                          <div className="text-xs text-green-600">
                            + {selectedWorkQuery.proofFiles.length - 3} more files
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {selectedWorkQuery.superadminResponse && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Label className="text-xs md:text-sm font-semibold text-yellow-900">Superadmin Response</Label>
                  <div className="mt-1 p-2 bg-white rounded border">
                    <p className="text-sm whitespace-pre-wrap">{selectedWorkQuery.superadminResponse}</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full sm:w-auto h-9 md:h-10"
                  onClick={() => setWorkQueryDialogOpen(false)}
                >
                  Close
                </Button>
                <Button 
                  type="button"
                  variant="default"
                  className="w-full sm:w-auto h-9 md:h-10"
                  onClick={() => window.open(`/work-queries/${selectedWorkQuery._id}`, '_blank')}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Open Full Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Alert Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">Create New Alert</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddAlert} className="space-y-3 md:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm md:text-base">
                  Alert Title <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="title" 
                  name="title" 
                  placeholder="Enter alert title" 
                  required 
                  disabled={submitting}
                  className="h-9 md:h-10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="severity" className="text-sm md:text-base">
                  Severity <span className="text-red-500">*</span>
                </Label>
                <select
                  id="severity"
                  name="severity"
                  className="flex h-9 md:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                  disabled={submitting}
                  defaultValue="medium"
                >
                  <option value="">Select severity</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="site" className="text-sm md:text-base">
                  Site <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="site" 
                  name="site" 
                  placeholder="Enter site name" 
                  required 
                  disabled={submitting}
                  className="h-9 md:h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reportedBy" className="text-sm md:text-base">
                  Reported By <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="reportedBy" 
                  name="reportedBy" 
                  placeholder="Enter reporter name" 
                  required 
                  disabled={submitting}
                  className="h-9 md:h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTo" className="text-sm md:text-base">Assigned To</Label>
                <Input 
                  id="assignedTo" 
                  name="assignedTo" 
                  placeholder="Assign to staff" 
                  disabled={submitting}
                  className="h-9 md:h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm md:text-base">
                  Date <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="date" 
                  name="date" 
                  type="date" 
                  defaultValue={new Date().toISOString().split('T')[0]}
                  required 
                  disabled={submitting}
                  className="h-9 md:h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="text-sm md:text-base">
                  Time <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="time" 
                  name="time" 
                  type="time" 
                  defaultValue={new Date().toTimeString().slice(0, 5)}
                  required 
                  disabled={submitting}
                  className="h-9 md:h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm md:text-base">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Describe the issue in detail..."
                rows={isMobileView ? 4 : 5}
                required 
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm md:text-base">Upload Photos (Max 5)</Label>
              <div className="border-2 border-dashed rounded-lg p-3 md:p-4 text-center">
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={submitting || photoFiles.length >= 5}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-9 md:h-10"
                  disabled={submitting || photoFiles.length >= 5}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Click to upload photos
                  {photoFiles.length > 0 && ` (${photoFiles.length}/5)`}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports JPG, PNG up to 5MB each
                </p>
              </div>

              {photoFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Uploaded Photos:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {photoFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square border rounded-md overflow-hidden">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemovePhoto(index)}
                          disabled={submitting}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <p className="text-xs truncate mt-1">{file.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 h-9 md:h-10"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 h-9 md:h-10" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Alert'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AlertsSection;