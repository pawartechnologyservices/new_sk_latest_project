"use client";

import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Shield, 
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  User as UserIcon,
  Settings,
  AlertTriangle,
  Loader2,
  Save,
  Download,
  Trash2,
  Menu,
  X,
  Home,
  Users,
  ClipboardList,
  BarChart3,
  LogOut
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import userService from "@/services/userService";
import { useRole } from "@/context/RoleContext";
import { User as UserType } from "@/types/user";

// Dashboard Header Component with Hamburger Menu
interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
  showMenu?: boolean;
}

const DashboardHeader = ({ title, subtitle, onMenuClick, showMenu = true }: DashboardHeaderProps) => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-4 sticky top-0 z-40 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu for Mobile */}
          {showMenu && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
            {subtitle && (
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Menu Button Alternative (if needed) */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </motion.header>
  );
};

// Mobile Navigation Drawer Component
interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  userName: string;
  userRole: string;
}

const MobileNavDrawer = ({ isOpen, onClose, onNavigate, userName, userRole }: MobileNavDrawerProps) => {
  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/supervisor' },
    { icon: Users, label: 'Employees', path: '/supervisor/employees' },
    { icon: ClipboardList, label: 'Tasks', path: '/supervisor/tasks' },
    { icon: User, label: 'Profile', path: '/supervisor/profile' },
    { icon: BarChart3, label: 'Reports', path: '/supervisor/reports' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-800 shadow-xl z-50 lg:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Drawer Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                {/* User Info */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-500 text-white">
                      {userName?.charAt(0) || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {userName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {userRole}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto p-4">
                <nav className="space-y-2">
                  {navItems.map((item) => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      className="w-full justify-start gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        onNavigate(item.path);
                        onClose();
                      }}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Button>
                  ))}
                </nav>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => {
                    localStorage.removeItem('sk_user');
                    window.location.href = '/login';
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Main Supervisor Profile Component
const SupervisorProfile = () => {
  const navigate = useNavigate();
  const outletContext = useOutletContext<{ onMenuClick?: () => void }>();
  const { user: authUser, isAuthenticated } = useRole();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    site: "",
  });

  useEffect(() => {
    if (authUser && isAuthenticated) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [authUser, isAuthenticated]);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      
      const userId = authUser?._id || authUser?.id;
      
      if (!userId) {
        throw new Error("No user ID found in auth context");
      }
      
      // Use getAllUsers and find the current user
      const allUsersResponse = await userService.getAllUsers();
      const foundUser = allUsersResponse.allUsers.find((user: UserType) => 
        user._id === userId || user.id === userId
      );
      
      if (foundUser) {
        setCurrentUser(foundUser);
        setFormData({
          name: foundUser.name || "",
          email: foundUser.email || "",
          phone: foundUser.phone || "",
          department: foundUser.department || "",
          site: foundUser.site || "",
        });
      } else {
        // Fallback to localStorage
        const storedUser = localStorage.getItem('sk_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
          setFormData({
            name: parsedUser.name || "",
            email: parsedUser.email || "",
            phone: parsedUser.phone || "",
            department: parsedUser.department || "",
            site: parsedUser.site || "",
          });
          toast.warning("Using cached user data");
        } else {
          throw new Error("User not found");
        }
      }
      
    } catch (error: any) {
      console.error("Error fetching user:", error);
      toast.error("Failed to load user data");
      
      // Set default values if fetch fails
      setFormData({
        name: "Supervisor User",
        email: "supervisor@sk.com",
        phone: "+1 234 567 8902",
        department: "Operations",
        site: "Main Office",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !currentUser._id) {
      toast.error("No user data available");
      return;
    }
    
    setSaving(true);
    
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        site: formData.site,
        isActive: currentUser.isActive,
        firstName: formData.name.split(' ')[0] || "",
        lastName: formData.name.split(' ').slice(1).join(' ') || "",
        joinDate: currentUser.joinDate || new Date().toISOString()
      };

      const updatedUser = await userService.updateUser(currentUser._id, updateData);
      
      // Update local state
      setCurrentUser(prev => prev ? { ...prev, ...updatedUser } : null);
      
      // Update localStorage
      const storedUser = localStorage.getItem('sk_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const updatedStoredUser = {
          ...parsedUser,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          site: formData.site
        };
        localStorage.setItem('sk_user', JSON.stringify(updatedStoredUser));
      }
      
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExportData = () => {
    try {
      const data = {
        profile: formData,
        accountInfo: {
          userId: currentUser?._id,
          role: currentUser?.role,
          status: currentUser?.isActive ? "Active" : "Inactive",
          joinDate: currentUser?.joinDate,
          lastUpdated: new Date().toISOString()
        }
      };
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `supervisor-profile-${currentUser?._id || 'data'}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success("Data exported successfully!");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      toast.error("Account deletion feature not implemented yet");
      // In a real app, you would call: await userService.deleteUser(currentUser._id);
    }
  };

  const handleMenuClick = () => {
    if (outletContext?.onMenuClick) {
      outletContext.onMenuClick();
    } else {
      setMobileMenuOpen(true);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'superadmin': return 'destructive';
      case 'admin': return 'destructive';
      case 'manager': return 'default';
      case 'supervisor': return 'secondary';
      case 'employee': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader 
          title="My Profile" 
          subtitle="Manage your account settings"
          onMenuClick={handleMenuClick}
        />
        <MobileNavDrawer
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          onNavigate={handleNavigate}
          userName={formData.name}
          userRole="Supervisor"
        />
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6 md:p-8 text-center">
              <AlertTriangle className="h-12 w-12 md:h-16 md:w-16 mx-auto text-yellow-500 mb-4" />
              <h2 className="text-lg md:text-xl font-bold mb-2">Authentication Required</h2>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-4">
                Please log in to view your profile.
              </p>
              <Button onClick={() => window.location.href = '/login'} className="w-full sm:w-auto">
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader 
          title="My Profile" 
          subtitle="Manage your account settings"
          onMenuClick={handleMenuClick}
        />
        <MobileNavDrawer
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          onNavigate={handleNavigate}
          userName={formData.name}
          userRole="Supervisor"
        />
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
            <p className="ml-3 text-sm md:text-base text-gray-500 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader 
        title="My Profile" 
        subtitle="Manage your account settings and preferences"
        onMenuClick={handleMenuClick}
      />
      
      <MobileNavDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onNavigate={handleNavigate}
        userName={formData.name}
        userRole="Supervisor"
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 md:p-6 max-w-6xl mx-auto space-y-4 md:space-y-6"
      >
        {/* User Header Card - Mobile Optimized */}
        <Card className="border shadow-sm overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar className="h-16 w-16 md:h-20 md:w-20 border-4 border-background shadow-lg mx-auto sm:mx-0">
                <AvatarFallback className="text-xl md:text-2xl bg-gradient-to-br from-primary to-primary/70 text-white">
                  {getInitials(formData.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h1 className="text-xl md:text-2xl font-bold break-words">{formData.name}</h1>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    <Badge variant={getRoleColor(currentUser?.role || '')} className="whitespace-nowrap">
                      <Shield className="h-3 w-3 mr-1" />
                      {currentUser?.role?.toUpperCase() || 'SUPERVISOR'}
                    </Badge>
                    <Badge variant={currentUser?.isActive ? 'default' : 'secondary'} className="whitespace-nowrap">
                      {getStatusIcon(currentUser?.isActive || false)}
                      <span className="ml-1 capitalize">
                        {currentUser?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </Badge>
                  </div>
                </div>
                
                {/* Contact Info - Stack on mobile */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1 justify-center sm:justify-start">
                    <Mail className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{formData.email}</span>
                  </div>
                  <div className="flex items-center gap-1 justify-center sm:justify-start">
                    <Building2 className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{formData.department || 'No department'}</span>
                  </div>
                  <div className="flex items-center gap-1 justify-center sm:justify-start">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{formData.site || 'No site'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs - Mobile Optimized */}
        <Tabs defaultValue="profile" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1">
            <TabsTrigger value="profile" className="flex items-center gap-1 md:gap-2 py-2 px-1 md:px-3 text-xs md:text-sm">
              <UserIcon className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden xs:inline">Profile</span>
              <span className="xs:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-1 md:gap-2 py-2 px-1 md:px-3 text-xs md:text-sm">
              <Settings className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden xs:inline">Account</span>
              <span className="xs:hidden">Details</span>
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-1 md:gap-2 py-2 px-1 md:px-3 text-xs md:text-sm">
              <Settings className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden xs:inline">Actions</span>
              <span className="xs:hidden">Actions</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab - Mobile Optimized */}
          <TabsContent value="profile">
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl">Personal Information</CardTitle>
                <CardDescription className="text-sm">
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                <form onSubmit={handleProfileSubmit} className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4" />
                        Full Name
                      </Label>
                      <Input 
                        id="name" 
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                        required
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </Label>
                      <Input 
                        id="phone" 
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter your phone number"
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department" className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4" />
                        Department
                      </Label>
                      <Input 
                        id="department" 
                        value={formData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        placeholder="Enter your department"
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="site" className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4" />
                        Site/Location
                      </Label>
                      <Input 
                        id="site" 
                        value={formData.site}
                        onChange={(e) => handleInputChange('site', e.target.value)}
                        placeholder="Enter your site location"
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        Member Since
                      </Label>
                      <div className="px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800 text-sm">
                        {formatDate(currentUser?.joinDate || '')}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex flex-col sm:flex-row justify-end gap-2">
                    <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab - Mobile Optimized */}
          <TabsContent value="account">
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl">Account Details</CardTitle>
                <CardDescription className="text-sm">
                  Your account information and metadata
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 md:pt-0 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-500 dark:text-gray-400">User ID</Label>
                  <div className="font-mono text-xs md:text-sm bg-gray-100 dark:bg-gray-800 p-2 md:p-3 rounded break-all">
                    {currentUser?._id || 'N/A'}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400">Role</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getRoleColor(currentUser?.role || '')} className="text-xs">
                        {currentUser?.role?.toUpperCase() || 'SUPERVISOR'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400">Status</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(currentUser?.isActive || false)}
                      <span className="text-sm capitalize">
                        {currentUser?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400">Join Date</Label>
                    <p className="text-sm font-medium mt-1">{formatDate(currentUser?.joinDate || '')}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400">Last Updated</Label>
                    <p className="text-sm font-medium mt-1 flex items-center">
                      <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span>Just now</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Actions Tab - Mobile Optimized */}
          <TabsContent value="actions">
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl">Account Actions</CardTitle>
                <CardDescription className="text-sm">
                  Manage your account data and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 md:pt-0 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-500 dark:text-gray-400">Export Data</Label>
                  <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-xs md:text-sm mb-3">
                      Download a copy of your profile data in JSON format. This includes your personal information and account details.
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-sm"
                      onClick={handleExportData}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export My Data
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-gray-500 dark:text-gray-400">Account Deletion</Label>
                  <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950/20">
                    <p className="text-xs md:text-sm mb-3 text-red-600 dark:text-red-400">
                      Warning: This action is permanent and cannot be undone. All your data will be permanently deleted.
                    </p>
                    <Button 
                      variant="destructive" 
                      className="w-full justify-start text-sm"
                      onClick={handleDeleteAccount}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default SupervisorProfile;