import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Building, 
  Users, 
  UserCheck, 
  UserX, 
  UserPlus,
  Search,
  RefreshCw,
  Loader2,
  MapPin,
  Briefcase,
  AlertCircle,
  Eye,
  Phone,
  Mail,
  Shield,
  UserCog,
  Calendar,
  Clock,
  ChevronDown,
  ChevronRight,
  FileText,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  Filter,
  MoreVertical,
  Menu,
  ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useRole } from "@/context/RoleContext";
import { useOutletContext } from "react-router-dom";
import { siteService } from "@/services/SiteService";
import taskService from "@/services/TaskService";
import supervisorService, { Supervisor as ImportedSupervisor, CreateSupervisorData } from "@/services/supervisorService";

// Mobile responsive site card
const MobileSiteCard = ({
  site,
  onViewDetails,
  getStaffingStatusBadge
}: {
  site: SiteWithSupervisors;
  onViewDetails: (site: SiteWithSupervisors) => void;
  getStaffingStatusBadge: (status: SiteWithSupervisors['staffingStatus']) => JSX.Element;
}) => {
  return (
    <Card className="mb-3 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{site.name}</h3>
              <p className="text-xs text-muted-foreground">{site.clientName}</p>
            </div>
          </div>
          {getStaffingStatusBadge(site.staffingStatus)}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center gap-1 text-sm">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span className="truncate">{site.location}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span>Required: {site.requiredSupervisors}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-2">
            <Badge variant={site.assignedSupervisors.length > 0 ? "default" : "outline"}>
              Assigned: {site.assignedSupervisors.length}
            </Badge>
            <Badge variant="outline" className="bg-blue-50">
              Available: {site.availableSupervisors.length}
            </Badge>
          </div>
          <div className="flex gap-1">
            <Badge variant="outline" className="bg-yellow-50 text-xs">
              P:{site.pendingTasks}
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-xs">
              IP:{site.inProgressTasks}
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-xs">
              C:{site.completedTasks}
            </Badge>
          </div>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => onViewDetails(site)}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

// Mobile responsive supervisor card
const MobileSupervisorCard = ({
  supervisor,
  onToggleStatus,
  onEdit,
  onDelete,
  getInitials
}: {
  supervisor: Supervisor;
  onToggleStatus: (supervisor: Supervisor) => void;
  onEdit: (supervisor: Supervisor) => void;
  onDelete: (id: string) => void;
  getInitials: (name: string) => string;
}) => {
  return (
    <Card className="mb-3 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-amber-100 text-amber-700">
                {getInitials(supervisor.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold">{supervisor.name}</h3>
                <Badge 
                  variant={supervisor.status === 'active' ? "default" : "secondary"}
                  className={supervisor.status === 'active' ? "bg-green-100 text-green-800" : ""}
                >
                  {supervisor.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">ID: {supervisor._id.slice(-6)}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onToggleStatus(supervisor)}>
                {supervisor.status === 'active' ? (
                  <XCircle className="h-4 w-4 mr-2 text-amber-600" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                )}
                {supervisor.status === 'active' ? 'Deactivate' : 'Activate'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(supervisor)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(supervisor._id)} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs truncate flex-1">{supervisor.email}</span>
          </div>
          {supervisor.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs">{supervisor.phone}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Department</p>
            <Badge variant="outline" className="mt-1">
              {supervisor.department || 'N/A'}
            </Badge>
          </div>
          <div className="flex justify-end gap-1">
            <Badge variant="outline" className="bg-blue-50">
              Current: {supervisor.currentTasks || 0}
            </Badge>
            <Badge variant="outline" className="bg-green-50">
              Comp: {supervisor.completedTasks || 0}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Mobile responsive site details dialog content
const MobileSiteDetailsContent = ({
  site,
  getStaffingStatusBadge,
  getInitials
}: {
  site: SiteWithSupervisors;
  getStaffingStatusBadge: (status: SiteWithSupervisors['staffingStatus']) => JSX.Element;
  getInitials: (name: string) => string;
}) => {
  const [activeTab, setActiveTab] = useState('assigned');

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="assigned" className="text-xs py-2">
            Assigned ({site.assignedSupervisors.length})
          </TabsTrigger>
          <TabsTrigger value="available" className="text-xs py-2">
            Available ({site.availableSupervisors.length})
          </TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs py-2">
            Tasks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assigned" className="mt-4">
          {site.assignedSupervisors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No supervisors assigned to this site
            </div>
          ) : (
            <div className="space-y-3">
              {site.assignedSupervisors.map((supervisor) => (
                <Card key={supervisor._id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-green-100 text-green-700">
                          {getInitials(supervisor.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">{supervisor.name}</h4>
                          <Badge variant="outline" className="bg-green-50 text-xs">Active</Badge>
                        </div>
                        {supervisor.email && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{supervisor.email}</span>
                          </div>
                        )}
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="bg-blue-50 text-xs">
                            Current: {supervisor.currentTasks || 0}
                          </Badge>
                          <Badge variant="outline" className="bg-green-50 text-xs">
                            Comp: {supervisor.completedTasks || 0}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="mt-4">
          {site.availableSupervisors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No available supervisors found
            </div>
          ) : (
            <div className="space-y-3">
              {site.availableSupervisors.map((supervisor) => (
                <Card key={supervisor._id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {getInitials(supervisor.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{supervisor.name}</h4>
                        <p className="text-xs text-muted-foreground">Available for assignment</p>
                        {supervisor.email && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{supervisor.email}</span>
                          </div>
                        )}
                        <Button size="sm" variant="outline" className="mt-2 w-full">
                          <UserPlus className="h-3 w-3 mr-1" />
                          Assign
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Card className="bg-yellow-50">
              <CardContent className="p-3 text-center">
                <AlertCircle className="h-5 w-5 mx-auto text-yellow-600 mb-1" />
                <p className="text-lg font-bold text-yellow-700">{site.pendingTasks}</p>
                <p className="text-xs text-yellow-600">Pending</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50">
              <CardContent className="p-3 text-center">
                <Clock className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                <p className="text-lg font-bold text-blue-700">{site.inProgressTasks}</p>
                <p className="text-xs text-blue-600">In Progress</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50">
              <CardContent className="p-3 text-center">
                <CheckCircle className="h-5 w-5 mx-auto text-green-600 mb-1" />
                <p className="text-lg font-bold text-green-700">{site.completedTasks}</p>
                <p className="text-xs text-green-600">Completed</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm">Site Information</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Client</p>
                  <p className="text-sm font-medium truncate">{site.clientName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium truncate">{site.location}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Required</p>
                  <p className="text-sm font-medium">{site.requiredSupervisors}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Assigned</p>
                  <p className="text-sm font-medium">{site.assignedSupervisors.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Available</p>
                  <p className="text-sm font-medium">{site.availableSupervisors.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm font-medium">{getStaffingStatusBadge(site.staffingStatus)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Types
interface Supervisor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'supervisor';
  status: 'active' | 'inactive';
  assignedSites?: string[];
  currentTasks?: number;
  completedTasks?: number;
  tasks?: any[];
  lastActive?: string;
  department?: string;
  joinDate?: string;
  reportsTo?: string;
  assignedManagers?: string[];
  isActive?: boolean;
}

interface SiteWithSupervisors {
  _id: string;
  name: string;
  clientName: string;
  location: string;
  status: string;
  managerCount?: number;
  supervisorCount?: number;
  requiredSupervisors: number;
  assignedSupervisors: Supervisor[];
  availableSupervisors: Supervisor[];
  totalSupervisors: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  staffingStatus: 'fully-staffed' | 'partially-staffed' | 'under-staffed' | 'over-staffed';
}

// Helper function to calculate supervisor count from staffDeployment
const calculateSupervisorCount = (site: any): number => {
  if (!site) return 2; // Default fallback
  
  // First check if supervisorCount is directly available (from ExtendedSite)
  if (site.supervisorCount !== undefined && site.supervisorCount > 0) {
    return site.supervisorCount;
  }
  
  // Otherwise calculate from staffDeployment
  if (site.staffDeployment && Array.isArray(site.staffDeployment)) {
    const supervisorStaff = site.staffDeployment.find(
      (staff: any) => staff.role && staff.role.toLowerCase().includes('supervisor')
    );
    
    if (supervisorStaff && supervisorStaff.count) {
      return Number(supervisorStaff.count) || 2;
    }
  }
  
  return 2; // Default fallback
};

const ManagerSiteSupervisorsPage = () => {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const { user: authUser, isAuthenticated } = useRole();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sites, setSites] = useState<SiteWithSupervisors[]>([]);
  const [allSupervisors, setAllSupervisors] = useState<Supervisor[]>([]);
  const [addedSupervisors, setAddedSupervisors] = useState<Supervisor[]>([]);
  const [selectedSite, setSelectedSite] = useState<SiteWithSupervisors | null>(null);
  const [showSiteDetails, setShowSiteDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("site-supervisors");
  const [showAddSupervisorDialog, setShowAddSupervisorDialog] = useState(false);
  const [editingSupervisor, setEditingSupervisor] = useState<Supervisor | null>(null);
  
  // Mobile responsive state
  const [isMobileView, setIsMobileView] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Form state for adding/editing supervisor
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    department: '',
    status: 'active' as 'active' | 'inactive'
  });

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
    if (authUser && isAuthenticated) {
      fetchData();
      fetchAddedSupervisors();
    } else {
      setLoading(false);
    }
  }, [authUser, isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const managerId = authUser?._id || authUser?.id;
      if (!managerId) {
        throw new Error("Manager ID not found");
      }

      // Fetch all sites and tasks
      let allSites = [];
      let allTasks = [];
      
      try {
        allSites = await siteService.getAllSites();
        console.log('All sites with counts:', allSites.map((s: any) => ({
          name: s.name,
          supervisorCount: s.supervisorCount,
          staffDeployment: s.staffDeployment
        })));
      } catch (error) {
        console.error('Error fetching sites:', error);
        allSites = [];
      }
      
      try {
        allTasks = await taskService.getAllTasks();
      } catch (error) {
        console.error('Error fetching tasks:', error);
        allTasks = [];
      }

      // Fetch all supervisors
      const supervisors = await fetchAllSupervisors();
      setAllSupervisors(supervisors);

      // Get sites where manager is assigned
      const managerSites = allSites.filter((site: any) => {
        if (!site || !site._id) return false;
        
        const siteTasks = allTasks.filter((task: any) => task && task.siteId === site._id);
        
        const isManagerAssigned = siteTasks.some((task: any) => 
          task && task.assignedUsers && task.assignedUsers.some((user: any) => 
            user && user.userId === managerId && user.role === 'manager'
          )
        );

        return isManagerAssigned;
      });

      // Process each site
      const sitesWithSupervisors = await Promise.all(
        managerSites.map(site => processSiteWithSupervisors(site, allTasks, supervisors))
      );

      setSites(sitesWithSupervisors);

    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error(error.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAddedSupervisors = async () => {
    try {
      const managerId = authUser?._id || authUser?.id;
      if (!managerId) return;

      // Get all supervisors and filter by reportsTo
      const allSupers = await supervisorService.getAllSupervisors();
      
      // Filter supervisors where reportsTo === managerId
      const mySupervisors = allSupers.filter(sup => sup.reportsTo === managerId);
      
      // Enhance with task counts
      const enhancedSupervisors = await Promise.all(
        mySupervisors.map(async (sup: ImportedSupervisor) => {
          try {
            const tasks = await taskService.getTasksByAssignee(sup._id);
            const currentTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length;
            const completedTasks = tasks.filter(t => t.status === 'completed').length;
            
            return {
              ...sup,
              role: 'supervisor' as const,
              currentTasks,
              completedTasks,
              status: sup.isActive ? 'active' as const : 'inactive' as const
            };
          } catch (error) {
            return {
              ...sup,
              role: 'supervisor' as const,
              currentTasks: 0,
              completedTasks: 0,
              status: sup.isActive ? 'active' as const : 'inactive' as const
            };
          }
        })
      );
      
      setAddedSupervisors(enhancedSupervisors);
    } catch (error) {
      console.error("Error fetching added supervisors:", error);
      toast.error("Failed to load added supervisors");
    }
  };

  const fetchAllSupervisors = async (): Promise<Supervisor[]> => {
    try {
      // Use the supervisor service instead of direct fetch
      const supervisors = await supervisorService.getAllSupervisors();
      return supervisors.map((s: ImportedSupervisor) => ({
        _id: s._id,
        name: s.name,
        email: s.email,
        phone: s.phone || '',
        role: 'supervisor' as const,
        status: s.isActive ? 'active' as const : 'inactive' as const,
        department: s.department,
        joinDate: s.joinDate,
        reportsTo: s.reportsTo,
        isActive: s.isActive
      }));
    } catch (error) {
      console.error("Error fetching supervisors:", error);
      return [];
    }
  };

  const processSiteWithSupervisors = async (
    site: any, 
    allTasks: any[], 
    allSupervisors: Supervisor[]
  ): Promise<SiteWithSupervisors> => {
    const safeSite = site || {};
    const siteTasks = (allTasks || []).filter(task => task && task.siteId === safeSite._id);
    
    // Get assigned supervisors
    const assignedSupervisorIds = new Set<string>();
    const assignedSupervisors: Supervisor[] = [];
    
    siteTasks.forEach(task => {
      if (task && task.assignedUsers) {
        task.assignedUsers.forEach((user: any) => {
          if (user && user.role === 'supervisor' && user.userId && !assignedSupervisorIds.has(user.userId)) {
            assignedSupervisorIds.add(user.userId);
            
            const supervisor = allSupervisors.find(s => s && s._id === user.userId) || {
              _id: user.userId,
              name: user.name || 'Unknown',
              email: user.email || '',
              phone: user.phone || '',
              role: 'supervisor' as const,
              status: 'active'
            };
            
            const supervisorTasks = siteTasks.filter(t => 
              t && t.assignedUsers && t.assignedUsers.some((u: any) => u && u.userId === user.userId)
            );
            
            supervisor.currentTasks = supervisorTasks.filter(t => 
              t && t.status !== 'completed' && t.status !== 'cancelled'
            ).length;
            
            supervisor.completedTasks = supervisorTasks.filter(t => 
              t && t.status === 'completed'
            ).length;
            
            assignedSupervisors.push(supervisor);
          }
        });
      }
    });
    
    const availableSupervisors = (allSupervisors || []).filter(s => 
      s && s._id && !assignedSupervisorIds.has(s._id)
    );
    
    // Calculate required supervisors from site data
    const requiredSupervisors = calculateSupervisorCount(safeSite);
    
    let staffingStatus: SiteWithSupervisors['staffingStatus'] = 'under-staffed';
    if (assignedSupervisors.length >= requiredSupervisors) {
      staffingStatus = assignedSupervisors.length > requiredSupervisors ? 'over-staffed' : 'fully-staffed';
    } else if (assignedSupervisors.length > 0) {
      staffingStatus = 'partially-staffed';
    }
    
    return {
      _id: safeSite._id || '',
      name: safeSite.name || 'Unnamed Site',
      clientName: safeSite.clientName || 'Unknown Client',
      location: safeSite.location || 'Unknown Location',
      status: safeSite.status || 'active',
      requiredSupervisors,
      assignedSupervisors,
      availableSupervisors,
      totalSupervisors: assignedSupervisors.length,
      pendingTasks: siteTasks.filter(t => t && t.status === 'pending').length,
      inProgressTasks: siteTasks.filter(t => t && t.status === 'in-progress').length,
      completedTasks: siteTasks.filter(t => t && t.status === 'completed').length,
      staffingStatus
    };
  };

  const handleAddSupervisor = async () => {
    try {
      const managerId = authUser?._id || authUser?.id;
      if (!managerId) {
        toast.error("Manager ID not found");
        return;
      }

      const supervisorData: CreateSupervisorData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        department: formData.department,
        reportsTo: managerId
      };

      await supervisorService.createSupervisor(supervisorData);
      
      toast.success("Supervisor added successfully!");
      setShowAddSupervisorDialog(false);
      resetForm();
      fetchAddedSupervisors();
      fetchData(); // Refresh site supervisors too
    } catch (error: any) {
      toast.error(error.message || "Failed to add supervisor");
    }
  };

  const handleUpdateSupervisor = async () => {
    if (!editingSupervisor) return;

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        isActive: formData.status === 'active'
      };

      await supervisorService.updateSupervisor(editingSupervisor._id, updateData);
      
      toast.success("Supervisor updated successfully!");
      setShowAddSupervisorDialog(false);
      setEditingSupervisor(null);
      resetForm();
      fetchAddedSupervisors();
      fetchData(); // Refresh site supervisors too
    } catch (error: any) {
      toast.error(error.message || "Failed to update supervisor");
    }
  };

  const handleDeleteSupervisor = async (supervisorId: string) => {
    if (!confirm("Are you sure you want to delete this supervisor?")) return;

    try {
      await supervisorService.deleteSupervisor(supervisorId);
      toast.success("Supervisor deleted successfully!");
      fetchAddedSupervisors();
      fetchData(); // Refresh site supervisors too
    } catch (error: any) {
      toast.error(error.message || "Failed to delete supervisor");
    }
  };

  const handleToggleStatus = async (supervisor: Supervisor) => {
    try {
      const updatedSupervisor = await supervisorService.toggleSupervisorStatus(supervisor._id);
      toast.success(`Supervisor ${updatedSupervisor.isActive ? 'activated' : 'deactivated'} successfully!`);
      fetchAddedSupervisors();
      fetchData(); // Refresh site supervisors too
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle status");
    }
  };

  const openEditDialog = (supervisor: Supervisor) => {
    setEditingSupervisor(supervisor);
    setFormData({
      name: supervisor.name,
      email: supervisor.email,
      phone: supervisor.phone || '',
      password: '',
      department: supervisor.department || '',
      status: supervisor.status
    });
    setShowAddSupervisorDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      department: '',
      status: 'active'
    });
    setEditingSupervisor(null);
  };

  const getStaffingStatusBadge = (status: SiteWithSupervisors['staffingStatus']) => {
    switch (status) {
      case 'fully-staffed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">✓ Full</Badge>;
      case 'partially-staffed':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">⚠ Partial</Badge>;
      case 'under-staffed':
        return <Badge variant="destructive">✗ Under</Badge>;
      case 'over-staffed':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">⟳ Over</Badge>;
      default:
        return <Badge variant="outline">?</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredSites = sites.filter(site => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (site.name || '').toLowerCase().includes(query) ||
      (site.clientName || '').toLowerCase().includes(query) ||
      (site.location || '').toLowerCase().includes(query)
    );
  });

  const filteredAddedSupervisors = addedSupervisors.filter(sup => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (sup.name || '').toLowerCase().includes(query) ||
      (sup.email || '').toLowerCase().includes(query) ||
      (sup.department || '').toLowerCase().includes(query)
    );
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    await fetchAddedSupervisors();
    setRefreshing(false);
  };

  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader 
          title="Site Supervisors" 
          subtitle="Manage supervisors across your sites"
          onMenuClick={onMenuClick}
        />
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6 md:p-8 text-center">
              <AlertCircle className="h-12 w-12 md:h-16 md:w-16 mx-auto text-yellow-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
              <p className="text-sm md:text-base text-muted-foreground mb-4">
                Please log in to view site supervisors.
              </p>
              <Button onClick={() => window.location.href = '/login'} className="w-full md:w-auto">
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader 
          title="Site Supervisors" 
          subtitle="Loading..."
          onMenuClick={onMenuClick}
        />
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
            <p className="ml-3 text-sm md:text-base text-muted-foreground">Loading data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        title="Supervisor Management" 
        subtitle="Manage site supervisors and view your added supervisors"
        onMenuClick={onMenuClick}
      />

      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4">
        {/* Search and Action Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sites or supervisors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={refreshing}
              size={isMobileView ? "icon" : "default"}
              className={isMobileView ? "h-10 w-10" : ""}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''} ${!isMobileView ? 'mr-2' : ''}`} />
              {!isMobileView && "Refresh"}
            </Button>
            <Button 
              onClick={() => {
                resetForm();
                setShowAddSupervisorDialog(true);
              }}
              size={isMobileView ? "icon" : "default"}
              className={isMobileView ? "h-10 w-10" : ""}
            >
              <UserPlus className={`h-4 w-4 ${!isMobileView ? 'mr-2' : ''}`} />
              {!isMobileView && "Add Supervisor"}
            </Button>
            {isMobileView && (
              <Button 
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Filters */}
        {showMobileFilters && isMobileView && (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Filter by Site</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All Sites" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sites</SelectItem>
                      {sites.map(site => (
                        <SelectItem key={site._id} value={site._id}>
                          {site.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Filter by Status</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Card */}
        <Card>
          <CardContent className="p-4 md:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 h-auto">
                <TabsTrigger value="site-supervisors" className="text-xs md:text-sm py-2">
                  <Building className="h-4 w-4 mr-2" />
                  <span className="hidden xs:inline">Site Supervisors</span>
                  <span className="xs:hidden">Sites</span> ({sites.length})
                </TabsTrigger>
                <TabsTrigger value="added-supervisors" className="text-xs md:text-sm py-2">
                  <UserPlus className="h-4 w-4 mr-2" />
                  <span className="hidden xs:inline">My Supervisors</span>
                  <span className="xs:hidden">Added</span> ({addedSupervisors.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="site-supervisors" className="m-0">
                {/* Mobile View - Cards */}
                {isMobileView ? (
                  <div className="space-y-3">
                    {filteredSites.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No sites found
                      </div>
                    ) : (
                      filteredSites.map((site) => (
                        <MobileSiteCard
                          key={site._id}
                          site={site}
                          onViewDetails={(site) => {
                            setSelectedSite(site);
                            setShowSiteDetails(true);
                          }}
                          getStaffingStatusBadge={getStaffingStatusBadge}
                        />
                      ))
                    )}
                  </div>
                ) : (
                  /* Desktop View - Table */
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">Site & Client</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-center">Required</TableHead>
                          <TableHead className="text-center">Assigned</TableHead>
                          <TableHead className="text-center">Available</TableHead>
                          <TableHead className="text-center">Tasks</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSites.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                              No sites found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredSites.map((site) => (
                            <TableRow key={site._id} className="cursor-pointer hover:bg-muted/50" onClick={() => {
                              setSelectedSite(site);
                              setShowSiteDetails(true);
                            }}>
                              <TableCell className="whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <Building className="h-4 w-4 text-primary flex-shrink-0" />
                                  <div>
                                    <div className="font-medium">{site.name}</div>
                                    <div className="text-xs text-muted-foreground">{site.clientName}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                <div className="flex items-center gap-1 text-sm">
                                  <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                  <span className="truncate max-w-[150px]">{site.location}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                {getStaffingStatusBadge(site.staffingStatus)}
                              </TableCell>
                              <TableCell className="text-center font-medium">
                                {site.requiredSupervisors}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant={site.assignedSupervisors.length > 0 ? "default" : "outline"}>
                                  {site.assignedSupervisors.length}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className="bg-blue-50">
                                  {site.availableSupervisors.length}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center gap-1">
                                  <Badge variant="outline" className="bg-yellow-50 text-xs px-1">
                                    P:{site.pendingTasks}
                                  </Badge>
                                  <Badge variant="outline" className="bg-blue-50 text-xs px-1">
                                    IP:{site.inProgressTasks}
                                  </Badge>
                                  <Badge variant="outline" className="bg-green-50 text-xs px-1">
                                    C:{site.completedTasks}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSite(site);
                                  setShowSiteDetails(true);
                                }}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="added-supervisors" className="m-0">
                {/* Mobile View - Cards */}
                {isMobileView ? (
                  <div className="space-y-3">
                    {filteredAddedSupervisors.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No supervisors added yet. Click "Add Supervisor" to get started.
                      </div>
                    ) : (
                      filteredAddedSupervisors.map((supervisor) => (
                        <MobileSupervisorCard
                          key={supervisor._id}
                          supervisor={supervisor}
                          onToggleStatus={handleToggleStatus}
                          onEdit={openEditDialog}
                          onDelete={handleDeleteSupervisor}
                          getInitials={getInitials}
                        />
                      ))
                    )}
                  </div>
                ) : (
                  /* Desktop View - Table */
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">Supervisor</TableHead>
                          <TableHead className="whitespace-nowrap">Contact</TableHead>
                          <TableHead className="whitespace-nowrap">Department</TableHead>
                          <TableHead className="text-center whitespace-nowrap">Current Tasks</TableHead>
                          <TableHead className="text-center whitespace-nowrap">Completed</TableHead>
                          <TableHead className="text-center whitespace-nowrap">Status</TableHead>
                          <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAddedSupervisors.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              No supervisors added yet. Click "Add Supervisor" to get started.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredAddedSupervisors.map((supervisor) => (
                            <TableRow key={supervisor._id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-amber-100 text-amber-700 text-xs">
                                      {getInitials(supervisor.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{supervisor.name}</div>
                                    <div className="text-xs text-muted-foreground">ID: {supervisor._id.slice(-6)}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                    <span className="text-xs truncate max-w-[150px]">{supervisor.email}</span>
                                  </div>
                                  {supervisor.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                      <span className="text-xs">{supervisor.phone}</span>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {supervisor.department || 'N/A'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className="bg-blue-50">
                                  {supervisor.currentTasks || 0}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className="bg-green-50">
                                  {supervisor.completedTasks || 0}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge 
                                  variant={supervisor.status === 'active' ? "default" : "secondary"}
                                  className={supervisor.status === 'active' ? "bg-green-100 text-green-800" : ""}
                                >
                                  {supervisor.status === 'active' ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleToggleStatus(supervisor)}
                                    title={supervisor.status === 'active' ? 'Deactivate' : 'Activate'}
                                  >
                                    {supervisor.status === 'active' ? (
                                      <XCircle className="h-4 w-4 text-amber-600" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditDialog(supervisor)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteSupervisor(supervisor._id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Supervisor Dialog */}
      <Dialog open={showAddSupervisorDialog} onOpenChange={(open) => {
        if (!open) {
          resetForm();
        }
        setShowAddSupervisorDialog(open);
      }}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <UserPlus className="h-5 w-5" />
              {editingSupervisor ? 'Edit Supervisor' : 'Add New Supervisor'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="John Doe"
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="john@example.com"
                  required
                  className="h-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+1 (555) 123-4567"
                  className="h-10"
                />
              </div>
              {!editingSupervisor && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    required={!editingSupervisor}
                    className="h-10"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  placeholder="Operations"
                  className="h-10"
                />
              </div>
              {editingSupervisor && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => {
              resetForm();
              setShowAddSupervisorDialog(false);
            }} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button 
              onClick={editingSupervisor ? handleUpdateSupervisor : handleAddSupervisor}
              disabled={!formData.name || !formData.email || (!editingSupervisor && !formData.password)}
              className="w-full sm:w-auto"
            >
              {editingSupervisor ? 'Update' : 'Add'} Supervisor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Site Details Dialog */}
      {selectedSite && (
        <Dialog open={showSiteDetails} onOpenChange={setShowSiteDetails}>
          <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Building className="h-5 w-5" />
                {selectedSite.name}
              </DialogTitle>
            </DialogHeader>

            {isMobileView ? (
              <MobileSiteDetailsContent
                site={selectedSite}
                getStaffingStatusBadge={getStaffingStatusBadge}
                getInitials={getInitials}
              />
            ) : (
              <Tabs defaultValue="assigned" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="assigned">
                    Assigned ({selectedSite.assignedSupervisors.length})
                  </TabsTrigger>
                  <TabsTrigger value="available">
                    Available ({selectedSite.availableSupervisors.length})
                  </TabsTrigger>
                  <TabsTrigger value="tasks">
                    Tasks (P:{selectedSite.pendingTasks} | IP:{selectedSite.inProgressTasks} | C:{selectedSite.completedTasks})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="assigned" className="space-y-4 mt-4">
                  {selectedSite.assignedSupervisors.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No supervisors assigned to this site
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedSite.assignedSupervisors.map((supervisor) => (
                        <Card key={supervisor._id}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-green-100 text-green-700">
                                  {getInitials(supervisor.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold">{supervisor.name}</h4>
                                  <Badge variant="outline" className="bg-green-50">Active</Badge>
                                </div>
                                <div className="mt-2 space-y-1 text-sm">
                                  {supervisor.email && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Mail className="h-3 w-3" />
                                      <span className="text-xs">{supervisor.email}</span>
                                    </div>
                                  )}
                                  {supervisor.phone && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Phone className="h-3 w-3" />
                                      <span className="text-xs">{supervisor.phone}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="mt-3 flex gap-2">
                                  <Badge variant="outline" className="bg-blue-50">
                                    Current: {supervisor.currentTasks || 0}
                                  </Badge>
                                  <Badge variant="outline" className="bg-green-50">
                                    Completed: {supervisor.completedTasks || 0}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="available" className="space-y-4 mt-4">
                  {selectedSite.availableSupervisors.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No available supervisors found
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedSite.availableSupervisors.map((supervisor) => (
                        <Card key={supervisor._id}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-blue-100 text-blue-700">
                                  {getInitials(supervisor.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold">{supervisor.name}</h4>
                                <p className="text-xs text-muted-foreground">Available for assignment</p>
                                <div className="mt-2 space-y-1 text-sm">
                                  {supervisor.email && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Mail className="h-3 w-3" />
                                      <span className="text-xs">{supervisor.email}</span>
                                    </div>
                                  )}
                                </div>
                                <Button size="sm" variant="outline" className="mt-3">
                                  <UserPlus className="h-3 w-3 mr-1" />
                                  Assign
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="tasks" className="space-y-4 mt-4">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <Card className="bg-yellow-50">
                      <CardContent className="p-4 text-center">
                        <AlertCircle className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
                        <p className="text-2xl font-bold text-yellow-700">{selectedSite.pendingTasks}</p>
                        <p className="text-xs text-yellow-600">Pending</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-blue-50">
                      <CardContent className="p-4 text-center">
                        <Clock className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                        <p className="text-2xl font-bold text-blue-700">{selectedSite.inProgressTasks}</p>
                        <p className="text-xs text-blue-600">In Progress</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-50">
                      <CardContent className="p-4 text-center">
                        <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
                        <p className="text-2xl font-bold text-green-700">{selectedSite.completedTasks}</p>
                        <p className="text-xs text-green-600">Completed</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Site Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Site Information</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Client</p>
                          <p className="font-medium">{selectedSite.clientName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Location</p>
                          <p className="font-medium">{selectedSite.location}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Required Supervisors</p>
                          <p className="font-medium">{selectedSite.requiredSupervisors}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Assigned Supervisors</p>
                          <p className="font-medium">{selectedSite.assignedSupervisors.length}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Available Supervisors</p>
                          <p className="font-medium">{selectedSite.availableSupervisors.length}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Staffing Status</p>
                          <p className="font-medium">{getStaffingStatusBadge(selectedSite.staffingStatus)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ManagerSiteSupervisorsPage;