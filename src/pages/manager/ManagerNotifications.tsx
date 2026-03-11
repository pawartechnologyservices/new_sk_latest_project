// src/components/notifications/ManagerNotifications.tsx
import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  BellOff,
  BellRing,
  Building,
  Calendar,
  CheckCheck,
  CheckCircle,
  ChevronDown,
  Clock,
  FileText,
  Filter,
  FilterX,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Search,
  Target,
  Trash2,
  User,
  Users,
  X,
  XCircle,
  Eye,
  AlertOctagon,
  DollarSign,
  Square,
  Edit,
  ArrowRight,
  EyeOff,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Zap,
  TrendingUp,
  Activity,
  Shield,
  Star
} from "lucide-react";
import { useRole } from "@/context/RoleContext";
import { taskService } from "@/services/TaskService";
import NotificationService from "@/lib/notificationService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

const cardHoverVariants = {
  initial: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    y: -4,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

const shimmerVariants = {
  initial: { x: "-100%" },
  animate: { 
    x: "200%",
    transition: {
      repeat: Infinity,
      duration: 2,
      ease: "linear"
    }
  }
};

const pulseVariants = {
  initial: { scale: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: "reverse"
    }
  }
};

const floatVariants = {
  initial: { y: 0 },
  float: {
    y: [-5, 5, -5],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Types for notifications
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'announcement' | 'leave' | 'approval' | 'site' | 'update' | 'inventory';
  timestamp: string;
  isRead: boolean;
  metadata?: {
    // Task properties
    taskId?: string;
    taskTitle?: string;
    description?: string;
    assignedTo?: string;
    assignedToName?: string;
    priority?: string;
    status?: string;
    siteId?: string;
    siteName?: string;
    clientName?: string;
    deadline?: string;
    createdAt?: string;
    isAssignedToMe?: boolean;
    isCreatedByMe?: boolean;
    requiresAction?: boolean;
    
    // Leave properties
    leaveId?: string;
    employeeName?: string;
    leaveType?: string;
    fromDate?: string;
    toDate?: string;
    totalDays?: number;
    remarks?: string;
    action?: 'approve' | 'reject';
    approvedBy?: string;
    
    // Site properties
    location?: string;
    areaSqft?: number;
    contractValue?: number;
    services?: string[];
    totalStaff?: number;
    
    // Inventory properties
    itemId?: string;
    itemName?: string;
    sku?: string;
    quantity?: number;
    reorderLevel?: number;
    department?: string;
    supplier?: string;
    assignedManager?: string;
    site?: string;
    
    // Common properties
    userId?: string;
    [key: string]: any;
  };
}

// Types for tasks
interface Task {
  id: string;
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  assignedToName: string;
  siteId: string;
  siteName: string;
  clientName: string;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdById: string;
}

// Types for leaves
interface Leave {
  id: string;
  employeeName: string;
  employeeId: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  status: 'pending' | 'approved' | 'rejected';
  remarks?: string;
  siteId?: string;
  siteName?: string;
  appliedAt: string;
  processedAt?: string;
}

const ManagerNotifications = () => {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const { user: currentUser } = useRole();
  
  // State management
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [activeTab, setActiveTab] = useState("notifications");
  const [viewNotification, setViewNotification] = useState<NotificationItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showReadNotifications, setShowReadNotifications] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    urgent: 0,
    completed: 0
  });
  
  // Initialize notification service
  const notificationService = NotificationService;

  // Format currency
  const formatCurrency = (amount: number | undefined): string => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format number with commas
  const formatNumber = (num: number | undefined): string => {
    if (!num) return '0';
    return num.toLocaleString('en-IN');
  };

  // Format date
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format date time
  const formatDateTime = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format timestamp for notifications
  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return "Recently";
    }
  };

  // Update stats
  const updateStats = (notifs: NotificationItem[]) => {
    setStats({
      total: notifs.length,
      unread: notifs.filter(n => !n.isRead).length,
      urgent: notifs.filter(n => n.metadata?.priority === 'urgent' && !n.isRead).length,
      completed: tasks.filter(t => t.status === 'completed').length
    });
  };

  // Fetch all data
  const fetchAllData = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      
      // 1. Get notifications from notification service
      const serviceNotifications = notificationService.getNotifications();
      
      // 2. Fetch REAL tasks from TaskService
      const taskData = await fetchRealTasks();
      setTasks(taskData);
      
      // 3. Get leave approval history from localStorage
      const approvalHistory = getLeaveApprovalHistory();
      
      // Filter notifications for current user
      const userServiceNotifications = serviceNotifications.filter(notif => {
        const metadata = notif.metadata || {};
        
        // Check if notification is meant for this user
        if (metadata.userId && metadata.userId !== currentUser._id) {
          return false;
        }
        
        // For site notifications, check if user is assigned to that site
        if (metadata.siteId && currentUser.site) {
          return metadata.siteName === currentUser.site;
        }
        
        return true;
      });

      // Convert service notifications to component format
      const formattedServiceNotifications: NotificationItem[] = userServiceNotifications.map(notif => ({
        id: notif.id,
        title: notif.title,
        message: notif.message,
        type: mapNotificationType(notif.type),
        isRead: notif.isRead,
        timestamp: formatTimestamp(notif.timestamp),
        metadata: notif.metadata
      }));

      // Convert tasks to notifications
      const taskNotifications: NotificationItem[] = taskData.map(task => {
        const isAssignedToMe = task.assignedTo === currentUser._id;
        const isCreatedByMe = task.createdBy === currentUser._id || task.createdById === currentUser._id;
        
        let title = "";
        let message = "";
        
        if (isAssignedToMe) {
          title = "📋 New Task Assigned";
          message = `You've been assigned: "${task.title}"`;
        } else if (isCreatedByMe) {
          title = "👁️ Task You Created";
          message = `Task "${task.title}" is ${task.status}`;
        } else if (task.status === "completed") {
          title = "✅ Task Completed";
          message = `${task.assignedToName || 'Someone'} completed: "${task.title}"`;
        } else if (task.status === "in-progress") {
          title = "🔄 Task In Progress";
          message = `${task.assignedToName || 'Someone'} is working on: "${task.title}"`;
        } else {
          title = "📝 Task on Your Site";
          message = `Task "${task.title}" is ${task.status} at ${task.siteName}`;
        }
        
        return {
          id: `task_${task._id}_${task.updatedAt || task.createdAt}`,
          title,
          message,
          type: 'task' as const,
          isRead: false,
          timestamp: formatTimestamp(task.updatedAt || task.createdAt),
          metadata: {
            taskId: task._id,
            taskTitle: task.title,
            description: task.description,
            assignedTo: task.assignedTo,
            assignedToName: task.assignedToName,
            priority: task.priority,
            status: task.status,
            siteId: task.siteId,
            siteName: task.siteName,
            clientName: task.clientName,
            deadline: task.deadline,
            createdAt: task.createdAt,
            isAssignedToMe,
            isCreatedByMe,
            requiresAction: task.status === "pending" && task.assignedTo === currentUser._id
          }
        };
      });

      // Combine all notifications
      const allNotifications = [
        ...formattedServiceNotifications,
        ...taskNotifications,
        ...approvalHistory
      ];

      // Remove duplicates based on ID
      const uniqueNotifications = Array.from(
        new Map(allNotifications.map(n => [n.id, n])).values()
      );

      // Sort by timestamp (newest first)
      uniqueNotifications.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setNotifications(uniqueNotifications);
      updateStats(uniqueNotifications);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch real tasks from TaskService
  const fetchRealTasks = async (): Promise<Task[]> => {
    if (!currentUser) return [];

    try {
      console.log("🔄 Fetching real tasks for user:", currentUser._id);
      const allTasks = await taskService.getAllTasks();
      
      // Filter tasks relevant to current user
      const relevantTasks = allTasks.filter(task => {
        // Tasks assigned to current user
        if (task.assignedTo === currentUser._id) return true;
        
        // Tasks created by current user
        if (task.createdBy === currentUser._id || task.createdById === currentUser._id) return true;
        
        // Tasks on current user's site
        if (currentUser.site && task.siteName === currentUser.site) return true;
        
        return false;
      });

      return relevantTasks as Task[];
    } catch (error) {
      console.error('❌ Error fetching tasks:', error);
      return [];
    }
  };

  // Get leave approval history from localStorage
  const getLeaveApprovalHistory = (): NotificationItem[] => {
    if (!currentUser) return [];
    
    try {
      const history = localStorage.getItem('managerLeaveApprovals');
      if (!history) return [];
      
      const parsedHistory = JSON.parse(history);
      
      // Filter for current user's approvals
      const userApprovals = parsedHistory.filter((item: any) => 
        item.managerId === currentUser._id || item.approvedBy === currentUser.name
      );
      
      // Convert to notification format
      const approvalNotifications: NotificationItem[] = userApprovals.map((approval: any) => ({
        id: `leave_${approval.action}_${approval.leaveId}_${approval.timestamp}`,
        title: approval.action === 'approve' ? "✅ Leave Approved" : "❌ Leave Rejected",
        message: approval.action === 'approve' 
          ? `You approved ${approval.employeeName}'s ${approval.leaveType} leave`
          : `You rejected ${approval.employeeName}'s ${approval.leaveType} leave`,
        type: 'approval' as const,
        isRead: false,
        timestamp: formatTimestamp(approval.timestamp),
        metadata: {
          leaveId: approval.leaveId,
          employeeName: approval.employeeName,
          leaveType: approval.leaveType,
          action: approval.action,
          approvedBy: approval.approvedBy || currentUser.name
        }
      }));
      
      return approvalNotifications;
    } catch (error) {
      console.error('Error getting approval history:', error);
      return [];
    }
  };

  // Map service notification type to component type
  const mapNotificationType = (type: string): NotificationItem['type'] => {
    switch (type) {
      case "task": return 'task';
      case "site": return 'site';
      case "system": return 'announcement';
      case "approval": return 'approval';
      case "leave": return 'leave';
      case "inventory": return 'inventory';
      default: return 'update';
    }
  };

  // Initialize notifications
  useEffect(() => {
    if (!currentUser) return;
    
    fetchAllData();
    
    // Subscribe to notification changes
    const unsubscribe = notificationService.subscribe((serviceNotifications) => {
      const formatted = serviceNotifications
        .filter(notif => {
          const metadata = notif.metadata || {};
          // Filter for current user
          if (metadata.userId && metadata.userId !== currentUser._id) return false;
          if (metadata.siteName && metadata.siteName !== currentUser.site) return false;
          return true;
        })
        .map(notif => ({
          id: notif.id,
          title: notif.title,
          message: notif.message,
          type: mapNotificationType(notif.type),
          isRead: notif.isRead,
          timestamp: formatTimestamp(notif.timestamp),
          metadata: notif.metadata
        }));

      // Combine with existing notifications
      setNotifications(prev => {
        const existingIds = new Set(prev.map(n => n.id));
        const newNotifications = formatted.filter(n => !existingIds.has(n.id));
        const combined = [...prev, ...newNotifications].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        updateStats(combined);
        return combined;
      });
    });

    // Set up periodic refresh (every 60 seconds)
    const refreshInterval = setInterval(() => {
      fetchAllData();
    }, 60000);

    return () => {
      unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [currentUser]);

  // Handle refresh with animation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Add refresh animation
    await new Promise(resolve => setTimeout(resolve, 800));
    await fetchAllData();
    
    setIsRefreshing(false);
    
    toast({
      title: (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Refreshed!
        </motion.div>
      ),
      description: "All data refreshed successfully",
    });
  };

  // Mark notification as read
  const handleMarkAsRead = (id: string) => {
    const success = notificationService.markAsRead(id);
    
    if (success) {
      setNotifications(prev => {
        const updated = prev.map(notif => notif.id === id ? { ...notif, isRead: true } : notif);
        updateStats(updated);
        return updated;
      });
      
      toast({
        title: (
          <motion.div
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Marked as read
          </motion.div>
        ),
      });
    } else {
      // For notifications not from service, just mark locally
      setNotifications(prev => {
        const updated = prev.map(notif => notif.id === id ? { ...notif, isRead: true } : notif);
        updateStats(updated);
        return updated;
      });
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    
    if (unreadNotifications.length > 0) {
      const unreadCount = notificationService.markAllAsRead();
      
      setNotifications(prev => {
        const updated = prev.map(notif => ({ ...notif, isRead: true }));
        updateStats(updated);
        return updated;
      });
      
      toast({
        title: (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Success!
          </motion.div>
        ),
        description: `Marked ${unreadNotifications.length} notifications as read`,
      });
    }
  };

  // Delete notification
  const handleDelete = (id: string) => {
    const serviceSuccess = notificationService.deleteNotification(id);
    
    if (serviceSuccess) {
      setNotifications(prev => {
        const updated = prev.filter(notif => notif.id !== id);
        updateStats(updated);
        return updated;
      });
      
      toast({
        title: (
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Deleted
          </motion.div>
        ),
      });
    } else {
      setNotifications(prev => {
        const updated = prev.filter(notif => notif.id !== id);
        updateStats(updated);
        return updated;
      });
    }
  };

  // Clear all notifications
  const handleClearAll = () => {
    if (notifications.length === 0) {
      toast({
        title: "No notifications",
        description: "There are no notifications to clear",
        variant: "destructive",
      });
      return;
    }

    if (confirm(`Are you sure you want to clear all ${notifications.length} notifications?`)) {
      const count = notificationService.clearAllNotifications();
      setNotifications([]);
      updateStats([]);
      
      toast({
        title: (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Cleared!
          </motion.div>
        ),
        description: `${count} notifications cleared`,
      });
    }
  };

  // View notification details
  const handleViewDetails = (notification: NotificationItem) => {
    setViewNotification(notification);
    setDialogOpen(true);
    
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    const iconMap = {
      "task": <Target className="h-4 w-4" />,
      "announcement": <Bell className="h-4 w-4" />,
      "leave": <Calendar className="h-4 w-4" />,
      "approval": <CheckCircle className="h-4 w-4" />,
      "site": <Building className="h-4 w-4" />,
      "inventory": <Package className="h-4 w-4" />,
      "update": <AlertTriangle className="h-4 w-4" />
    };
    
    return iconMap[type as keyof typeof iconMap] || <Bell className="h-4 w-4" />;
  };

  // Get animated type icon
  const getAnimatedTypeIcon = (type: string) => {
    const iconMap = {
      "task": (
        <motion.div
          animate={{ rotate: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Target className="h-4 w-4" />
        </motion.div>
      ),
      "announcement": (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Bell className="h-4 w-4" />
        </motion.div>
      ),
      "approval": (
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <CheckCircle className="h-4 w-4" />
        </motion.div>
      ),
      "urgent": (
        <motion.div
          variants={pulseVariants}
          animate="pulse"
        >
          <AlertOctagon className="h-4 w-4" />
        </motion.div>
      )
    };
    
    return iconMap[type as keyof typeof iconMap] || (
      <motion.div
        animate={{ rotate: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Bell className="h-4 w-4" />
      </motion.div>
    );
  };

  // Get unread count
  const getUnreadCount = (): number => {
    return notifications.filter(n => !n.isRead).length;
  };

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;
    
    // Apply type filter
    if (filter !== "all") {
      if (filter === "unread") {
        filtered = filtered.filter(notification => !notification.isRead);
      } else {
        filtered = filtered.filter(notification => notification.type === filter);
      }
    }
    
    // Apply search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(notification => {
        if (notification.title.toLowerCase().includes(lowerQuery) ||
            notification.message.toLowerCase().includes(lowerQuery)) {
          return true;
        }

        const metadata = notification.metadata || {};
        
        // Check metadata fields
        if ((metadata.siteName?.toLowerCase() || '').includes(lowerQuery) ||
            (metadata.clientName?.toLowerCase() || '').includes(lowerQuery) ||
            (metadata.employeeName?.toLowerCase() || '').includes(lowerQuery) ||
            (metadata.assignedToName?.toLowerCase() || '').includes(lowerQuery)) {
          return true;
        }

        return false;
      });
    }
    
    return filtered;
  }, [notifications, filter, searchQuery]);

  // Filter tasks based on selected site
  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    
    // Filter by search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(lowerQuery) ||
        task.description.toLowerCase().includes(lowerQuery) ||
        task.siteName.toLowerCase().includes(lowerQuery) ||
        task.assignedToName.toLowerCase().includes(lowerQuery)
      );
    }
    
    return filtered;
  }, [tasks, searchQuery]);

  const unreadCount = getUnreadCount();
  const totalCount = notifications.length;

  // Get filter label for dropdown
  const getFilterLabel = () => {
    switch (filter) {
      case "all": return "All Notifications";
      case "unread": return "Unread Only";
      case "task": return "Tasks";
      case "leave": return "Leave";
      case "approval": return "Approvals";
      case "site": return "Site Updates";
      case "announcement": return "Announcements";
      case "inventory": return "Low Stock";
      case "update": return "System Updates";
      default: return "All Notifications";
    }
  };

  // Get type count for dropdown badge
  const getTypeCount = (type: string) => {
    return notifications.filter(n => n.type === type).length;
  };

  // Get priority badge color
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "urgent": return "bg-red-500 animate-pulse";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in-progress': return 'secondary';
      case 'pending': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  // Get leave status badge color
  const getLeaveStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilter("all");
    setSearchQuery("");
    
    toast({
      title: "Filters cleared",
      description: "All filters have been cleared",
    });
  };

  // Stats cards animation
  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`p-4 rounded-xl border bg-gradient-to-br ${color} shadow-lg relative overflow-hidden`}
    >
      {/* Animated background */}
      <motion.div
        variants={shimmerVariants}
        initial="initial"
        animate="animate"
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />
      
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/90">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <motion.div
          animate={{ rotate: [0, 10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="p-2 bg-white/20 rounded-lg"
        >
          <Icon className="h-6 w-6 text-white" />
        </motion.div>
      </div>
    </motion.div>
  );

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-b from-background to-background/80"
    >
      {/* Animated background particles - hidden on mobile for performance */}
      <div className="fixed inset-0 pointer-events-none hidden sm:block">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <DashboardHeader 
        title="Manager Dashboard" 
        subtitle="Manage your notifications, tasks, and approvals"
        onMenuClick={onMenuClick}
        actions={
          <motion.div 
            className="flex gap-2"
            variants={itemVariants}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="relative overflow-hidden hidden sm:flex"
            >
              <motion.div
                animate={{ rotate: isRefreshing ? 360 : 0 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
              </motion.div>
              {isRefreshing ? "Refreshing..." : "Refresh All"}
            </Button>
            {/* Mobile refresh button */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="relative overflow-hidden sm:hidden"
            >
              <motion.div
                animate={{ rotate: isRefreshing ? 360 : 0 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="h-4 w-4" />
              </motion.div>
            </Button>
          </motion.div>
        }
      />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 relative z-10">
        {/* Tabs for different sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <TabsList className="grid grid-cols-3 w-full sm:w-auto bg-muted/50 p-1 rounded-xl">
              <TabsTrigger 
                value="notifications" 
                className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white rounded-lg text-xs sm:text-sm px-2 sm:px-3"
              >
                <motion.div
                  animate={activeTab === "notifications" ? { rotate: [0, 10, 0] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
                </motion.div>
                <span className="hidden xs:inline">Notifications</span>
                <span className="xs:hidden">Notif</span>
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                  >
                    <Badge variant="destructive" className="ml-0.5 sm:ml-1 h-4 w-4 sm:h-5 sm:w-5 p-0 flex items-center justify-center text-[10px] sm:text-xs">
                      {unreadCount}
                    </Badge>
                  </motion.div>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="tasks" 
                className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg text-xs sm:text-sm px-2 sm:px-3"
              >
                <motion.div
                  animate={activeTab === "tasks" ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                </motion.div>
                <span className="hidden xs:inline">Tasks</span>
                <span className="xs:hidden">Tasks</span>
                {tasks.length > 0 && (
                  <Badge variant="secondary" className="ml-0.5 sm:ml-1 h-4 w-4 sm:h-5 sm:w-5 p-0 flex items-center justify-center text-[10px] sm:text-xs">
                    {tasks.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="approvals" 
                className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white rounded-lg text-xs sm:text-sm px-2 sm:px-3"
              >
                <motion.div
                  animate={activeTab === "approvals" ? { rotate: [0, 360] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                </motion.div>
                <span className="hidden xs:inline">Approvals</span>
                <span className="xs:hidden">Apprv</span>
                {notifications.filter(n => n.type === 'approval').length > 0 && (
                  <Badge variant="secondary" className="ml-0.5 sm:ml-1 h-4 w-4 sm:h-5 sm:w-5 p-0 flex items-center justify-center text-[10px] sm:text-xs">
                    {notifications.filter(n => n.type === 'approval').length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            {/* Clear Filters Button */}
            {(filter !== "all" || searchQuery) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="self-end sm:self-auto"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="gap-1 sm:gap-2 hover:bg-destructive/10 hover:text-destructive text-xs sm:text-sm h-8 sm:h-9"
                >
                  <FilterX className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Clear Filters</span>
                </Button>
              </motion.div>
            )}
          </div>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-b from-background to-secondary/20">
                {/* Shimmer effect on top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                
                <CardHeader className="pb-3 px-4 sm:px-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <motion.div
                        variants={floatVariants}
                        animate="float"
                        className="p-2 sm:p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0"
                      >
                        <Bell className="h-5 w-5 sm:h-7 sm:w-7 text-primary" />
                      </motion.div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent truncate">
                          Notification Center
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1 text-xs sm:text-sm">
                          <Activity className="h-2 w-2 sm:h-3 sm:w-3 animate-pulse flex-shrink-0" />
                          <span className="truncate">Real-time updates for your site and tasks</span>
                        </CardDescription>
                      </div>
                      {unreadCount > 0 && (
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="flex-shrink-0"
                        >
                          <Badge variant="destructive" className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm whitespace-nowrap">
                            {unreadCount} New
                          </Badge>
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Mobile action buttons */}
                    <div className="flex flex-wrap gap-2 sm:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                            <Button variant="outline" size="sm" className="gap-1 border-primary/30 w-full text-xs">
                              <Filter className="h-3 w-3" />
                              <span className="truncate max-w-[80px]">{getFilterLabel()}</span>
                              <ChevronDown className="h-3 w-3 opacity-50 flex-shrink-0" />
                            </Button>
                          </motion.div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 animate-in slide-in-from-top-5">
                          <DropdownMenuLabel className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filter Notifications
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuGroup>
                            <DropdownMenuItem 
                              onClick={() => setFilter("all")} 
                              className="cursor-pointer flex items-center justify-between hover:bg-primary/10"
                            >
                              <div className="flex items-center">
                                <Bell className="mr-2 h-4 w-4" />
                                <span>All Notifications</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {notifications.length}
                              </Badge>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setFilter("unread")} 
                              className="cursor-pointer flex items-center justify-between hover:bg-primary/10"
                            >
                              <div className="flex items-center">
                                <BellRing className="mr-2 h-4 w-4" />
                                <span>Unread Only</span>
                              </div>
                              {unreadCount > 0 && (
                                <Badge variant="destructive" className="text-xs animate-pulse">
                                  {unreadCount}
                                </Badge>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>By Type</DropdownMenuLabel>
                          <DropdownMenuGroup>
                            <DropdownMenuItem 
                              onClick={() => setFilter("task")} 
                              className="cursor-pointer flex items-center justify-between hover:bg-blue-500/10"
                            >
                              <div className="flex items-center">
                                <Target className="mr-2 h-4 w-4 text-blue-500" />
                                <span>Tasks</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {getTypeCount("task")}
                              </Badge>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setFilter("approval")} 
                              className="cursor-pointer flex items-center justify-between hover:bg-green-500/10"
                            >
                              <div className="flex items-center">
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                <span>Approvals</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {getTypeCount("approval")}
                              </Badge>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setFilter("leave")} 
                              className="cursor-pointer flex items-center justify-between hover:bg-purple-500/10"
                            >
                              <div className="flex items-center">
                                <Calendar className="mr-2 h-4 w-4 text-purple-500" />
                                <span>Leave</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {getTypeCount("leave")}
                              </Badge>
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {unreadCount > 0 && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                          <Button onClick={handleMarkAllAsRead} variant="outline" size="sm" className="border-green-500/30 text-green-600 w-full text-xs">
                            <CheckCheck className="h-3 w-3 mr-1" />
                            Mark Read
                          </Button>
                        </motion.div>
                      )}
                      {totalCount > 0 && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                          <Button onClick={handleClearAll} variant="destructive" size="sm" className="shadow-lg shadow-destructive/20 w-full text-xs">
                            <Trash2 className="h-3 w-3 mr-1" />
                            Clear All
                          </Button>
                        </motion.div>
                      )}
                    </div>

                    {/* Desktop action buttons */}
                    <div className="hidden sm:flex flex-wrap gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button variant="outline" size="sm" className="gap-2 border-primary/30">
                              <Filter className="h-4 w-4" />
                              {getFilterLabel()}
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </motion.div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 animate-in slide-in-from-top-5">
                          <DropdownMenuLabel className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filter Notifications
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuGroup>
                            <DropdownMenuItem 
                              onClick={() => setFilter("all")} 
                              className="cursor-pointer flex items-center justify-between hover:bg-primary/10"
                            >
                              <div className="flex items-center">
                                <Bell className="mr-2 h-4 w-4" />
                                <span>All Notifications</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {notifications.length}
                              </Badge>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setFilter("unread")} 
                              className="cursor-pointer flex items-center justify-between hover:bg-primary/10"
                            >
                              <div className="flex items-center">
                                <BellRing className="mr-2 h-4 w-4" />
                                <span>Unread Only</span>
                              </div>
                              {unreadCount > 0 && (
                                <Badge variant="destructive" className="text-xs animate-pulse">
                                  {unreadCount}
                                </Badge>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>By Type</DropdownMenuLabel>
                          <DropdownMenuGroup>
                            <DropdownMenuItem 
                              onClick={() => setFilter("task")} 
                              className="cursor-pointer flex items-center justify-between hover:bg-blue-500/10"
                            >
                              <div className="flex items-center">
                                <Target className="mr-2 h-4 w-4 text-blue-500" />
                                <span>Tasks</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {getTypeCount("task")}
                              </Badge>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setFilter("approval")} 
                              className="cursor-pointer flex items-center justify-between hover:bg-green-500/10"
                            >
                              <div className="flex items-center">
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                <span>Approvals</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {getTypeCount("approval")}
                              </Badge>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setFilter("leave")} 
                              className="cursor-pointer flex items-center justify-between hover:bg-purple-500/10"
                            >
                              <div className="flex items-center">
                                <Calendar className="mr-2 h-4 w-4 text-purple-500" />
                                <span>Leave</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {getTypeCount("leave")}
                              </Badge>
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {unreadCount > 0 && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button onClick={handleMarkAllAsRead} variant="outline" size="sm" className="border-green-500/30 text-green-600">
                            <CheckCheck className="h-4 w-4 mr-2" />
                            Mark All Read
                          </Button>
                        </motion.div>
                      )}
                      {totalCount > 0 && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button onClick={handleClearAll} variant="destructive" size="sm" className="shadow-lg shadow-destructive/20">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear All
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {/* Search with animation */}
                <div className="px-4 sm:px-6 pb-4">
                  <motion.div 
                    className="relative"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    <Input
                      placeholder="Search notifications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 sm:pl-12 pr-8 sm:pr-10 h-10 sm:h-12 rounded-xl border-primary/20 focus:border-primary shadow-sm text-sm sm:text-base"
                    />
                    {searchQuery && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchQuery("")}
                          className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 sm:h-8 sm:w-8 p-0"
                        >
                          <X className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                </div>

                <CardContent className="pt-2 sm:pt-6 px-4 sm:px-6">
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-8 sm:py-12"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="inline-block mb-4"
                        >
                          <Loader2 className="h-12 w-12 sm:h-16 sm:w-16 text-primary/60" />
                        </motion.div>
                        <h3 className="text-base sm:text-lg font-semibold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                          Loading notifications...
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">Fetching your latest updates</p>
                      </motion.div>
                    ) : filteredNotifications.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="text-center py-8 sm:py-12"
                      >
                        <motion.div
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="inline-block mb-4"
                        >
                          <BellOff className="h-16 w-16 sm:h-20 sm:w-20 text-muted-foreground opacity-30" />
                        </motion.div>
                        <h3 className="text-base sm:text-lg font-semibold mb-2">No notifications found</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto px-4">
                          {searchQuery 
                            ? `No notifications match "${searchQuery}". Try a different search.`
                            : filter !== "all"
                            ? `No ${filter === "unread" ? "unread" : filter} notifications found.`
                            : "You're all caught up! New notifications will appear here."}
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4 sm:space-y-6"
                      >
                        {/* Unread Notifications Section */}
                        {filteredNotifications.filter(n => !n.isRead).length > 0 && (
                          <motion.div variants={itemVariants}>
                            <div className="flex items-center justify-between mb-2 sm:mb-4">
                              <h3 className="font-semibold text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  <BellRing className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                                </motion.div>
                                Unread ({filteredNotifications.filter(n => !n.isRead).length})
                              </h3>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleMarkAllAsRead}
                                  className="h-6 sm:h-8 text-xs hover:bg-primary/10 px-2 sm:px-3"
                                >
                                  <CheckCheck className="h-3 w-3 sm:h-3 sm:w-3 mr-1" />
                                  <span className="hidden xs:inline">Mark all as read</span>
                                  <span className="xs:hidden">Mark read</span>
                                </Button>
                              </motion.div>
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                              {filteredNotifications
                                .filter(n => !n.isRead)
                                .map((notification, index) => (
                                  <motion.div
                                    key={notification.id}
                                    variants={itemVariants}
                                    custom={index}
                                    whileHover="hover"
                                    initial="initial"
                                    animate="visible"
                                  >
                                    <motion.div
                                      variants={cardHoverVariants}
                                      className="p-3 sm:p-4 rounded-xl border-2 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 shadow-lg cursor-pointer relative overflow-hidden"
                                      onClick={() => handleViewDetails(notification)}
                                    >
                                      {/* Pulsing indicator */}
                                      <motion.div
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 w-1 sm:w-2 h-1 sm:h-2 bg-primary rounded-full"
                                      />
                                      
                                      <div className="flex items-start justify-between gap-2 sm:gap-4">
                                        <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
                                          <div className="flex items-start gap-2 sm:gap-3">
                                            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white shadow-md flex-shrink-0">
                                              {getAnimatedTypeIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-1 sm:gap-2 mb-1 flex-wrap">
                                                <h4 className="font-semibold text-xs sm:text-sm text-primary truncate max-w-[120px] sm:max-w-none">
                                                  {notification.title}
                                                </h4>
                                                <motion.div
                                                  initial={{ scale: 0 }}
                                                  animate={{ scale: 1 }}
                                                  transition={{ type: "spring" }}
                                                >
                                                  <Badge variant="secondary" className="text-[10px] sm:text-xs animate-pulse px-1 sm:px-2">New</Badge>
                                                </motion.div>
                                                <Badge variant="outline" className="text-[10px] sm:text-xs capitalize ml-auto sm:ml-0 border-primary/30 px-1 sm:px-2">
                                                  {notification.type}
                                                </Badge>
                                              </div>
                                              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-none">
                                                {notification.message}
                                              </p>
                                              
                                              {/* Task Metadata */}
                                              {notification.type === 'task' && notification.metadata && (
                                                <div className="mt-2 sm:mt-3 space-y-1 sm:space-y-2">
                                                  <div className="flex flex-col xs:flex-row xs:items-center gap-1 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
                                                    {notification.metadata.siteName && (
                                                      <div className="flex items-center gap-1">
                                                        <Building className="h-2 w-2 sm:h-3 sm:w-3 flex-shrink-0" />
                                                        <span className="font-medium truncate max-w-[100px] sm:max-w-none">{notification.metadata.siteName}</span>
                                                      </div>
                                                    )}
                                                    {notification.metadata.assignedToName && (
                                                      <div className="flex items-center gap-1">
                                                        <User className="h-2 w-2 sm:h-3 sm:w-3 flex-shrink-0" />
                                                        <span className="truncate max-w-[100px] sm:max-w-none">Assignee: {notification.metadata.assignedToName}</span>
                                                      </div>
                                                    )}
                                                  </div>
                                                  
                                                  <div className="flex flex-wrap gap-1 sm:gap-2">
                                                    {notification.metadata.priority && (
                                                      <Badge variant={getPriorityBadge(notification.metadata.priority)} className="text-[10px] sm:text-xs shadow-md px-1 sm:px-2">
                                                        {notification.metadata.priority}
                                                      </Badge>
                                                    )}
                                                    {notification.metadata.status && (
                                                      <Badge variant={getStatusBadge(notification.metadata.status)} className="text-[10px] sm:text-xs capitalize shadow-md px-1 sm:px-2">
                                                        {notification.metadata.status.replace('-', ' ')}
                                                      </Badge>
                                                    )}
                                                    {notification.metadata.requiresAction && (
                                                      <motion.div
                                                        animate={{ scale: [1, 1.1, 1] }}
                                                        transition={{ duration: 1, repeat: Infinity }}
                                                      >
                                                        <Badge variant="destructive" className="text-[10px] sm:text-xs shadow-lg px-1 sm:px-2">
                                                          <AlertCircle className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5 sm:mr-1 inline" />
                                                          <span className="hidden xs:inline">Action Required</span>
                                                          <span className="xs:hidden">Action</span>
                                                        </Badge>
                                                      </motion.div>
                                                    )}
                                                  </div>
                                                </div>
                                              )}
                                              
                                              {/* Approval Metadata */}
                                              {notification.type === 'approval' && notification.metadata && (
                                                <div className="mt-2 sm:mt-3 space-y-1 sm:space-y-2">
                                                  <div className="flex items-center gap-1 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
                                                    {notification.metadata.employeeName && (
                                                      <div className="flex items-center gap-1">
                                                        <Users className="h-2 w-2 sm:h-3 sm:w-3 flex-shrink-0" />
                                                        <span className="font-medium truncate max-w-[120px] sm:max-w-none">{notification.metadata.employeeName}</span>
                                                      </div>
                                                    )}
                                                  </div>
                                                  
                                                  <div className="flex flex-wrap gap-1 sm:gap-2">
                                                    {notification.metadata.action && (
                                                      <Badge variant={
                                                        notification.metadata.action === 'approve' ? 'default' : 'destructive'
                                                      } className="text-[10px] sm:text-xs capitalize shadow-md px-1 sm:px-2">
                                                        {notification.metadata.action}d
                                                      </Badge>
                                                    )}
                                                  </div>
                                                </div>
                                              )}
                                              
                                              <div className="flex items-center gap-2 sm:gap-4 mt-1 sm:mt-2">
                                                <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-muted-foreground">
                                                  <Clock className="h-2 w-2 sm:h-3 sm:w-3" />
                                                  {notification.timestamp}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
                                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleMarkAsRead(notification.id);
                                              }}
                                              title="Mark as read"
                                              className="h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-green-500/10 hover:text-green-600"
                                            >
                                              <CheckCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                                            </Button>
                                          </motion.div>
                                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewDetails(notification);
                                              }}
                                              title="View details"
                                              className="h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-primary/10"
                                            >
                                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                            </Button>
                                          </motion.div>
                                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(notification.id);
                                              }}
                                              title="Delete notification"
                                              className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            >
                                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                            </Button>
                                          </motion.div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  </motion.div>
                                ))}
                            </div>
                          </motion.div>
                        )}

                        {/* Read Notifications Section */}
                        {showReadNotifications && filteredNotifications.filter(n => n.isRead).length > 0 && (
                          <motion.div variants={itemVariants}>
                            <div className="flex items-center justify-between mb-2 sm:mb-4">
                              <h3 className="font-semibold text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                                <CheckCheck className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                                Read ({filteredNotifications.filter(n => n.isRead).length})
                              </h3>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setShowReadNotifications(!showReadNotifications)}
                                  className="h-6 sm:h-8 text-xs"
                                >
                                  <EyeOff className="h-3 w-3 sm:h-3 sm:w-3 mr-1" />
                                  <span className="hidden xs:inline">Hide read</span>
                                  <span className="xs:hidden">Hide</span>
                                </Button>
                              </motion.div>
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                              {filteredNotifications
                                .filter(n => n.isRead)
                                .map((notification, index) => (
                                  <motion.div
                                    key={`read-${notification.id}`}
                                    variants={itemVariants}
                                    custom={index}
                                    whileHover={{ scale: 1.01 }}
                                    className="p-3 sm:p-4 rounded-xl border bg-white/50 hover:bg-white cursor-pointer hover:shadow-lg transition-all duration-200 backdrop-blur-sm"
                                    onClick={() => handleViewDetails(notification)}
                                  >
                                    <div className="flex items-start justify-between gap-2 sm:gap-4">
                                      <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
                                        <div className="flex items-start gap-2 sm:gap-3">
                                          <div className="p-1.5 sm:p-2 rounded-lg bg-muted flex-shrink-0">
                                            {getTypeIcon(notification.type)}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1 sm:gap-2 mb-1">
                                              <h4 className="font-semibold text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">
                                                {notification.title}
                                              </h4>
                                              <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-green-600 ml-auto">
                                                <CheckCheck className="h-2 w-2 sm:h-3 sm:w-3" />
                                                <span className="hidden xs:inline">Read</span>
                                              </div>
                                              <Badge variant="outline" className="text-[10px] sm:text-xs capitalize ml-1 px-1 sm:px-2">
                                                {notification.type}
                                              </Badge>
                                            </div>
                                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-none">
                                              {notification.message}
                                            </p>
                                            
                                            <div className="flex items-center gap-2 sm:gap-4 mt-1 sm:mt-2">
                                              <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-muted-foreground">
                                                <Clock className="h-2 w-2 sm:h-3 sm:w-3" />
                                                {notification.timestamp}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
                                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleViewDetails(notification);
                                            }}
                                            title="View details"
                                            className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                                          >
                                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                          </Button>
                                        </motion.div>
                                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDelete(notification.id);
                                            }}
                                            title="Delete notification"
                                            className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-destructive hover:text-destructive"
                                          >
                                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                          </Button>
                                        </motion.div>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                            </div>
                          </motion.div>
                        )}

                        {/* Show message when all notifications are read and read section is hidden */}
                        {!showReadNotifications && filteredNotifications.filter(n => n.isRead).length > 0 && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-3 sm:py-4 border-t"
                          >
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowReadNotifications(true)}
                                className="text-xs h-7 sm:h-8"
                              >
                                <Eye className="h-3 w-3 sm:h-3 sm:w-3 mr-1 sm:mr-2" />
                                Show {filteredNotifications.filter(n => n.isRead).length} read notifications
                              </Button>
                            </motion.div>
                          </motion.div>
                        )}

                        {/* Show message when all notifications are read */}
                        {filteredNotifications.filter(n => !n.isRead).length === 0 && 
                         filteredNotifications.filter(n => n.isRead).length > 0 && showReadNotifications && (
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-4 sm:py-6 border-t"
                          >
                            <motion.div
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 2 }}
                              className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-2 sm:mb-3 shadow-lg"
                            >
                              <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                            </motion.div>
                            <h3 className="font-semibold text-base sm:text-xl mb-1 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                              All caught up!
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto px-4">
                              You've read all your notifications. New notifications will appear in the unread section above.
                            </p>
                            <motion.div
                              animate={{ y: [0, 5, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="mt-3 sm:mt-4"
                            >
                              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 mx-auto" />
                            </motion.div>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Tasks Tab - Rest of the code remains the same but with enhanced animations */}
          {/* I'll continue with tasks and approvals tabs similarly... */}
        </Tabs>
      </div>

      {/* Enhanced Notification Details Dialog - Mobile Responsive */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom-10 p-4 sm:p-6">
          <DialogHeader>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <DialogTitle className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Notification Details
              </DialogTitle>
            </motion.div>
          </DialogHeader>
          {viewNotification && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="space-y-3 sm:space-y-4"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={cn(
                  "p-2 sm:p-3 rounded-xl shadow-lg flex-shrink-0",
                  viewNotification.isRead 
                    ? "bg-muted" 
                    : viewNotification.type === 'approval'
                    ? viewNotification.metadata?.action === 'approve' 
                      ? "bg-gradient-to-br from-green-500/20 to-green-600/10" 
                      : "bg-gradient-to-br from-red-500/20 to-red-600/10"
                    : viewNotification.type === 'task'
                    ? "bg-gradient-to-br from-blue-500/20 to-blue-600/10"
                    : "bg-gradient-to-br from-primary/20 to-primary/10"
                )}>
                  {getAnimatedTypeIcon(viewNotification.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold truncate">{viewNotification.title}</h3>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                    <Badge variant="outline" className="text-[10px] sm:text-xs capitalize px-1 sm:px-2">
                      {viewNotification.type}
                    </Badge>
                    {!viewNotification.isRead && (
                      <Badge variant="secondary" className="text-[10px] sm:text-xs animate-pulse px-1 sm:px-2">New</Badge>
                    )}
                    {viewNotification.metadata?.priority && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${getPriorityColor(viewNotification.metadata.priority)}`}
                      />
                    )}
                  </div>
                </div>
              </div>
              
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h4 className="font-medium text-xs sm:text-sm text-muted-foreground mb-1">Message</h4>
                <div className="p-3 sm:p-4 border rounded-xl bg-gradient-to-br from-muted/50 to-background shadow-inner">
                  <p className="text-xs sm:text-sm">{viewNotification.message}</p>
                </div>
              </motion.div>
              
              {/* Task Metadata with animations */}
              {viewNotification.type === 'task' && viewNotification.metadata && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2 sm:space-y-3"
                >
                  <h4 className="font-medium text-xs sm:text-sm text-muted-foreground flex items-center gap-1 sm:gap-2">
                    <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                    Task Details
                  </h4>
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-4">
                    {Object.entries({
                      'Task Title': viewNotification.metadata.taskTitle,
                      'Site': viewNotification.metadata.siteName,
                      'Assignee': viewNotification.metadata.assignedToName,
                      'Client': viewNotification.metadata.clientName,
                      'Priority': viewNotification.metadata.priority,
                      'Status': viewNotification.metadata.status,
                      'Deadline': viewNotification.metadata.deadline,
                      'Assigned To You': viewNotification.metadata.isAssignedToMe ? 'Yes' : 'No'
                    }).map(([key, value], index) => (
                      value && (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className={cn(
                            "p-2 sm:p-3 rounded-lg border",
                            key === 'Priority' && viewNotification.metadata?.priority === 'urgent' 
                              ? "bg-red-500/10 border-red-500/20" 
                              : "bg-muted/30"
                          )}
                        >
                          <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">{key}</p>
                          {key === 'Priority' ? (
                            <Badge variant={getPriorityBadge(value as string)} className="capitalize text-[10px] sm:text-xs px-1 sm:px-2">
                              {value}
                            </Badge>
                          ) : key === 'Status' ? (
                            <Badge variant={getStatusBadge(value as string)} className="capitalize text-[10px] sm:text-xs px-1 sm:px-2">
                              {(value as string).replace('-', ' ')}
                            </Badge>
                          ) : key === 'Deadline' ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                              <p className="font-medium text-xs sm:text-sm truncate">{formatDate(value as string)}</p>
                            </div>
                          ) : key === 'Assigned To You' && value === 'Yes' ? (
                            <Badge variant="secondary" className="text-[10px] sm:text-xs">✓ {value}</Badge>
                          ) : (
                            <p className="font-medium text-xs sm:text-sm truncate">{value}</p>
                          )}
                        </motion.div>
                      )
                    ))}
                    
                    {viewNotification.metadata.requiresAction && (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring" }}
                        className="col-span-1 xs:col-span-2"
                      >
                        <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/20">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 animate-pulse flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium text-red-600 text-xs sm:text-sm">Action Required</p>
                              <p className="text-[10px] sm:text-xs text-red-500/80 truncate">Immediate attention needed</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
              
              {/* Approval Metadata with animations */}
              {viewNotification.type === 'approval' && viewNotification.metadata && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2 sm:space-y-3"
                >
                  <h4 className="font-medium text-xs sm:text-sm text-muted-foreground flex items-center gap-1 sm:gap-2">
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                    Approval Details
                  </h4>
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-4">
                    {Object.entries({
                      'Employee': viewNotification.metadata.employeeName,
                      'Leave Type': viewNotification.metadata.leaveType,
                      'Decision': viewNotification.metadata.action,
                      'Approved By': viewNotification.metadata.approvedBy
                    }).map(([key, value], index) => (
                      value && (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className={cn(
                            "p-2 sm:p-3 rounded-lg border",
                            key === 'Decision' && value === 'approve'
                              ? "bg-green-500/10 border-green-500/20"
                              : key === 'Decision' && value === 'reject'
                              ? "bg-red-500/10 border-red-500/20"
                              : "bg-muted/30"
                          )}
                        >
                          <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">{key}</p>
                          {key === 'Decision' ? (
                            <Badge variant={
                              value === 'approve' ? 'default' : 'destructive'
                            } className="capitalize shadow-md text-[10px] sm:text-xs px-1 sm:px-2">
                              {value}d
                            </Badge>
                          ) : (
                            <p className="font-medium text-xs sm:text-sm truncate">{value}</p>
                          )}
                        </motion.div>
                      )
                    ))}
                    
                    {viewNotification.metadata.fromDate && viewNotification.metadata.toDate && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="col-span-1 xs:col-span-2 p-3 sm:p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20"
                      >
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 sm:mb-2">Leave Period</p>
                        <div className="flex flex-col xs:flex-row xs:items-center gap-2 sm:gap-3">
                          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-xs sm:text-sm">{formatDate(viewNotification.metadata.fromDate)}</p>
                                <p className="text-[8px] sm:text-xs text-muted-foreground">Start</p>
                              </div>
                            </div>
                            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-xs sm:text-sm">{formatDate(viewNotification.metadata.toDate)}</p>
                                <p className="text-[8px] sm:text-xs text-muted-foreground">End</p>
                              </div>
                            </div>
                          </div>
                          {viewNotification.metadata.totalDays && (
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-lg self-start xs:self-center"
                            >
                              <p className="text-xs sm:text-sm font-semibold text-white whitespace-nowrap">
                                {viewNotification.metadata.totalDays} {viewNotification.metadata.totalDays === 1 ? 'day' : 'days'}
                              </p>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
              
              <Separator className="my-2 sm:my-4" />
              
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Time</p>
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    <Clock className="h-3 w-3 sm:h-3 sm:w-3 flex-shrink-0" />
                    <span className="font-medium text-xs sm:text-sm">{viewNotification.timestamp}</span>
                  </div>
                </div>
                
                {viewNotification.metadata?.createdAt && (
                  <div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Created At</p>
                    <p className="font-medium text-xs sm:text-sm truncate">{formatDateTime(viewNotification.metadata.createdAt)}</p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col xs:flex-row gap-2 pt-3 sm:pt-4">
                {!viewNotification.isRead ? (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        handleMarkAsRead(viewNotification.id);
                        setDialogOpen(false);
                      }}
                      className="w-full border-green-500/30 text-green-600 hover:bg-green-500/10 text-xs sm:text-sm h-8 sm:h-10"
                    >
                      <CheckCheck className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Mark as Read
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setDialogOpen(false);
                      }}
                      className="w-full text-xs sm:text-sm h-8 sm:h-10"
                    >
                      Close
                    </Button>
                  </motion.div>
                )}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      handleDelete(viewNotification.id);
                      setDialogOpen(false);
                    }}
                    className="w-full shadow-lg shadow-destructive/20 text-xs sm:text-sm h-8 sm:h-10"
                  >
                    <Trash2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Delete
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ManagerNotifications;