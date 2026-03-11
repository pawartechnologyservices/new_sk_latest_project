import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus, Trash2, Edit, Eye, DollarSign, Calendar, Building,
  Loader2, AlertCircle, X, Receipt, ChevronDown, ChevronUp,
  TrendingUp, PieChart, Search, RefreshCw,
  ChevronLeft, ChevronRight, Filter, ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { siteService, Site } from "@/services/SiteService";
import { expenseService, Expense, CreateExpenseRequest, MonthlyExpense } from "@/services/expenseService";

// Expense Types and Categories
const ExpenseTypes = [
  { value: "operational", label: "Operational", icon: "🏭", color: "blue" },
  { value: "maintenance", label: "Maintenance", icon: "🔧", color: "yellow" },
  { value: "salary", label: "Salary", icon: "💰", color: "green" },
  { value: "utility", label: "Utility", icon: "⚡", color: "purple" },
  { value: "supplies", label: "Supplies", icon: "📦", color: "orange" },
  { value: "other", label: "Other", icon: "📌", color: "gray" }
];

const ExpenseCategories = [
  { value: "housekeeping", label: "Housekeeping", icon: "🧹" },
  { value: "security", label: "Security", icon: "🛡️" },
  { value: "parking", label: "Parking", icon: "🅿️" },
  { value: "waste_management", label: "Waste Mgmt", icon: "🗑️" },
  { value: "maintenance", label: "Maintenance", icon: "🔧" },
  { value: "electricity", label: "Electricity", icon: "⚡" },
  { value: "water", label: "Water", icon: "💧" },
  { value: "internet", label: "Internet", icon: "🌐" },
  { value: "salary", label: "Salary", icon: "💰" },
  { value: "supplies", label: "Supplies", icon: "📦" },
  { value: "equipment", label: "Equipment", icon: "🔨" },
  { value: "transportation", label: "Transport", icon: "🚚" },
  { value: "office_expense", label: "Office", icon: "📋" },
  { value: "other", label: "Other", icon: "📌" }
];

const PaymentMethods = [
  { value: "cash", label: "Cash", icon: "💵" },
  { value: "bank transfer", label: "Bank Transfer", icon: "🏦" },
  { value: "credit card", label: "Credit Card", icon: "💳" },
  { value: "cheque", label: "Cheque", icon: "📝" },
  { value: "upi", label: "UPI", icon: "📱" }
];

// Month names for display
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const ExpensesSection = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpense[]>([]);
  const [filteredSites, setFilteredSites] = useState<Site[]>([]);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [monthlyDialogOpen, setMonthlyDialogOpen] = useState(false);
  const [monthDetailsDialogOpen, setMonthDetailsDialogOpen] = useState(false);
  const [siteExpensesDialogOpen, setSiteExpensesDialogOpen] = useState(false);
  
  // Selected items
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<MonthlyExpense | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [editMode, setEditMode] = useState(false);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  // Form state
  const [formData, setFormData] = useState({
    expenseType: "",
    category: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    vendor: "",
    paymentMethod: ""
  });
  
  // Custom fields state
  const [customFields, setCustomFields] = useState<Array<{ fieldName: string; fieldValue: string }>>([]);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");

  // Stats state
  const [stats, setStats] = useState({
    totalExpenses: 0,
    averageExpense: 0,
    expenseCount: 0,
    categoryCount: 0
  });

  // Available years for filter
  const [availableYears, setAvailableYears] = useState<number[]>([new Date().getFullYear()]);

  // Mobile view state
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterSites();
  }, [sites, searchQuery]);

  useEffect(() => {
    calculateStats();
    updateAvailableYears();
  }, [expenses]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [sitesData, expensesData] = await Promise.all([
        siteService.getAllSites(),
        expenseService.getExpenses()
      ]);
      setSites(sitesData || []);
      setFilteredSites(sitesData || []);
      setExpenses(expensesData || []);
    } catch (error: any) {
      setError(error.message || "Failed to load data");
      toast.error(error.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const filterSites = () => {
    if (!searchQuery.trim()) {
      setFilteredSites(sites);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = sites.filter(site => 
      site.name.toLowerCase().includes(query) ||
      site.clientName.toLowerCase().includes(query) ||
      site.location.toLowerCase().includes(query)
    );
    setFilteredSites(filtered);
  };

  const calculateStats = () => {
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const avg = expenses.length > 0 ? total / expenses.length : 0;
    const categories = new Set(expenses.map(exp => exp.category));
    
    setStats({
      totalExpenses: total,
      averageExpense: avg,
      expenseCount: expenses.length,
      categoryCount: categories.size
    });
  };

  const updateAvailableYears = () => {
    const years = new Set(expenses.map(exp => new Date(exp.date).getFullYear()));
    const yearsArray = Array.from(years).sort((a, b) => b - a);
    if (yearsArray.length === 0) {
      yearsArray.push(new Date().getFullYear());
    }
    setAvailableYears(yearsArray);
  };

  const resetForm = () => {
    setFormData({
      expenseType: "",
      category: "",
      description: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      vendor: "",
      paymentMethod: ""
    });
    setCustomFields([]);
    setNewFieldName("");
    setNewFieldValue("");
    setEditMode(false);
    setSelectedExpense(null);
  };

  const handleAddExpense = (site: Site) => {
    setSelectedSite(site);
    resetForm();
    setAddDialogOpen(true);
  };

  const handleViewSiteExpenses = (site: Site) => {
    setSelectedSite(site);
    setSiteExpensesDialogOpen(true);
  };

  const handleViewMonthlyExpenses = async (site: Site) => {
    setSelectedSite(site);
    try {
      const monthly = await expenseService.getMonthlyExpenses(site._id);
      setMonthlyExpenses(monthly);
      setMonthlyDialogOpen(true);
    } catch (error) {
      toast.error("Failed to load monthly expenses");
    }
  };

  const handleViewMonthDetails = async (site: Site, month: number, year: number) => {
    try {
      // Filter expenses for the selected month and year
      const monthExpenses = expenses.filter(e => {
        const date = new Date(e.date);
        const expenseSiteId = typeof e.siteId === 'object' ? e.siteId._id : e.siteId;
        return expenseSiteId === site._id && 
               date.getMonth() + 1 === month && 
               date.getFullYear() === year;
      });
      
      // Create a monthly expense object
      const monthData: MonthlyExpense = {
        _id: { month, year },
        month,
        year,
        totalAmount: monthExpenses.reduce((sum, e) => sum + e.amount, 0),
        count: monthExpenses.length,
        categories: [...new Set(monthExpenses.map(e => e.category))],
        expenses: monthExpenses
      };
      
      setSelectedMonth(monthData);
      setSelectedSite(site);
      setMonthDetailsDialogOpen(true);
    } catch (error) {
      toast.error("Failed to load month details");
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    
    // Find the site
    const siteId = typeof expense.siteId === 'object' ? expense.siteId._id : expense.siteId;
    const site = sites.find(s => s._id === siteId);
    setSelectedSite(site || null);
    
    // Populate form
    setFormData({
      expenseType: expense.expenseType,
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      date: new Date(expense.date).toISOString().split('T')[0],
      vendor: expense.vendor,
      paymentMethod: expense.paymentMethod
    });
    setCustomFields(expense.customFields || []);
    
    setEditMode(true);
    setAddDialogOpen(true);
  };

  const handleViewExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setViewDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSite) {
      toast.error("Please select a site");
      return;
    }
    
    // Validate form
    const requiredFields = ['expenseType', 'category', 'description', 'amount', 'vendor', 'paymentMethod'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }
    
    if (parseFloat(formData.amount) <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    
    const expensePayload: CreateExpenseRequest = {
      siteId: selectedSite._id,
      ...formData,
      amount: parseFloat(formData.amount),
      customFields: customFields.filter(f => f.fieldName && f.fieldValue)
    };
    
    console.log('📤 Submitting expense:', expensePayload);
    
    try {
      setIsSubmitting(true);
      
      if (editMode && selectedExpense) {
        // Update existing expense
        const updated = await expenseService.updateExpense(selectedExpense._id, expensePayload);
        console.log('📥 Updated expense response:', updated);
        
        if (updated) {
          // Update the expenses array with the updated expense
          setExpenses(prevExpenses => 
            prevExpenses.map(exp => 
              exp._id === updated._id ? updated : exp
            )
          );
          toast.success("Expense updated successfully!");
        }
      } else {
        // Create new expense
        const created = await expenseService.createExpense(expensePayload);
        console.log('📥 Created expense response:', created);
        
        if (created) {
          // Add the new expense to the expenses array
          setExpenses(prevExpenses => [created, ...prevExpenses]);
          toast.success("Expense added successfully!");
        }
      }
      
      setAddDialogOpen(false);
      resetForm();
      
      // Refresh monthly data if needed
      if (selectedSite) {
        try {
          const monthly = await expenseService.getMonthlyExpenses(selectedSite._id);
          setMonthlyExpenses(monthly);
        } catch (error) {
          console.error("Failed to refresh monthly data:", error);
        }
      }
      
    } catch (error: any) {
      console.error('❌ Error in handleSubmit:', error);
      toast.error(error.message || "Failed to save expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) {
      return;
    }
    
    try {
      const result = await expenseService.deleteExpense(expenseId);
      if (result?.success) {
        // Remove the expense from the local state
        setExpenses(prevExpenses => prevExpenses.filter(exp => exp._id !== expenseId));
        toast.success("Expense deleted successfully!");
        
        // Close any open dialogs
        setViewDialogOpen(false);
        setMonthDetailsDialogOpen(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete expense");
    }
  };

  const handleAddCustomField = () => {
    if (newFieldName && newFieldValue) {
      setCustomFields([...customFields, { fieldName: newFieldName, fieldValue: newFieldValue }]);
      setNewFieldName("");
      setNewFieldValue("");
    }
  };

  const handleRemoveCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const toggleSection = (siteId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(siteId)) {
      newExpanded.delete(siteId);
    } else {
      newExpanded.add(siteId);
    }
    setExpandedSections(newExpanded);
  };

  const getSiteExpenses = (siteId: string) => {
    return expenses.filter(e => {
      const expenseSiteId = typeof e.siteId === 'object' ? e.siteId._id : e.siteId;
      return expenseSiteId === siteId;
    });
  };

  const getMonthExpenses = (siteId: string, month: number, year: number) => {
    return expenses.filter(e => {
      const date = new Date(e.date);
      const expenseSiteId = typeof e.siteId === 'object' ? e.siteId._id : e.siteId;
      return expenseSiteId === siteId && 
             date.getMonth() + 1 === month && 
             date.getFullYear() === year;
    });
  };

  const formatCurrency = (amount: number) => {
    return expenseService.formatCurrency(amount);
  };

  const formatDate = (dateString: string) => {
    return expenseService.formatDate(dateString);
  };

  const getMonthName = (month: number) => {
    return expenseService.getMonthName(month);
  };

  const getCategoryIcon = (category: string) => {
    const cat = ExpenseCategories.find(c => c.value === category);
    return cat?.icon || "📌";
  };

  const getPaymentMethodIcon = (method: string) => {
    const pm = PaymentMethods.find(m => m.value === method);
    return pm?.icon || "💳";
  };

  const getExpenseTypeColor = (type: string) => {
    const expenseType = ExpenseTypes.find(t => t.value === type);
    return expenseType?.color || "gray";
  };

  const changeYear = (increment: number) => {
    setSelectedYear(prev => prev + increment);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg">Loading expenses...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-6 px-2 sm:px-4 max-w-full overflow-x-hidden">
      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center text-red-700 text-sm sm:text-base">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
              <span className="flex-1 break-words">{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="ml-2 h-8 px-2 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-2 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Total</p>
                <p className="text-sm sm:text-lg lg:text-2xl font-bold truncate">{formatCurrency(stats.totalExpenses)}</p>
              </div>
              <DollarSign className="h-5 w-5 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-2 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Average</p>
                <p className="text-sm sm:text-lg lg:text-2xl font-bold truncate">{formatCurrency(stats.averageExpense)}</p>
              </div>
              <TrendingUp className="h-5 w-5 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-2 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Trans</p>
                <p className="text-sm sm:text-lg lg:text-2xl font-bold">{stats.expenseCount}</p>
              </div>
              <Receipt className="h-5 w-5 sm:h-8 sm:w-8 text-purple-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-2 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Categ</p>
                <p className="text-sm sm:text-lg lg:text-2xl font-bold">{stats.categoryCount}</p>
              </div>
              <PieChart className="h-5 w-5 sm:h-8 sm:w-8 text-amber-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar - Responsive */}
      <Card>
        <CardContent className="p-2 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full text-sm"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={loadData}
              size={isMobileView ? "default" : "default"}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sites List - Responsive Cards */}
      <div className="space-y-2 sm:space-y-4">
        {filteredSites.length === 0 ? (
          <Card>
            <CardContent className="p-6 sm:p-8 text-center">
              <Building className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-2 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">No Sites Found</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {searchQuery ? "Try adjusting your search" : "No sites available"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSites.map((site) => {
            const siteExpenses = getSiteExpenses(site._id);
            const siteTotal = siteExpenses.reduce((sum, e) => sum + e.amount, 0);
            const isExpanded = expandedSections.has(site._id);
            
            return (
              <Card key={site._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 sm:p-4">
                  {/* Site Header - Responsive */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                          <Building className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
                          <h3 className="font-semibold text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">{site.name}</h3>
                          <Badge variant={site.status === "active" ? "default" : "secondary"} className="text-xs px-1.5 py-0">
                            {site.status}
                          </Badge>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          <p className="truncate">{site.clientName}</p>
                          <div className="flex items-center gap-2 flex-wrap mt-0.5">
                            <span className="flex items-center">
                              <Receipt className="h-3 w-3 mr-1" />
                              {siteExpenses.length}
                            </span>
                            <span className="flex items-center font-medium text-green-600">
                              <DollarSign className="h-3 w-3 mr-1" />
                              {formatCurrency(siteTotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {siteExpenses.length > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleSection(site._id)}
                          className="h-7 w-7 p-0 flex-shrink-0"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>

                    {/* Action Buttons - Responsive Grid */}
                    <div className="grid grid-cols-3 gap-1 sm:flex sm:gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewMonthlyExpenses(site)}
                        className="text-xs px-1 sm:px-3"
                      >
                        <Calendar className="h-3 w-3 sm:mr-1" />
                        <span className="hidden sm:inline">Monthly</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewSiteExpenses(site)}
                        className="text-xs px-1 sm:px-3"
                      >
                        <Eye className="h-3 w-3 sm:mr-1" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAddExpense(site)}
                        className="text-xs px-1 sm:px-3"
                      >
                        <Plus className="h-3 w-3 sm:mr-1" />
                        <span className="hidden sm:inline">Add</span>
                      </Button>
                    </div>
                  </div>

                  {/* Recent Expenses - Expandable Section */}
                  {isExpanded && siteExpenses.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <h4 className="text-xs font-medium mb-2">Recent Expenses</h4>
                      
                      {/* Mobile View: Card Layout */}
                      <div className="space-y-2">
                        {siteExpenses.slice(0, 3).map((expense) => (
                          <div key={expense._id} className="border rounded-lg p-2 space-y-1.5">
                            <div className="flex justify-between items-start">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-xs truncate">{expense.description}</div>
                                <div className="text-xs text-muted-foreground">{formatDate(expense.date)}</div>
                              </div>
                              <Badge variant="secondary" className="text-xs ml-1">
                                {getCategoryIcon(expense.category)}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-muted-foreground truncate max-w-[100px]">{expense.vendor}</span>
                              <span className="font-medium">{formatCurrency(expense.amount)}</span>
                            </div>
                            <div className="flex justify-end gap-1 pt-1">
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleViewExpense(expense)}>
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEditExpense(expense)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleDeleteExpense(expense._id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {siteExpenses.length > 3 && (
                        <div className="mt-2 text-center">
                          <Button variant="link" size="sm" className="text-xs" onClick={() => handleViewSiteExpenses(site)}>
                            View all {siteExpenses.length} expenses
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Add/Edit Expense Dialog - Mobile Responsive */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="w-full max-w-full sm:max-w-3xl h-full sm:h-auto sm:max-h-[90vh] m-0 p-0 sm:p-6 rounded-none sm:rounded-lg overflow-hidden flex flex-col">
          <DialogHeader className="p-4 sm:p-6 pb-2 border-b sticky top-0 bg-background z-10">
            <DialogTitle className="text-lg sm:text-xl pr-8">
              {editMode ? "Edit Expense" : "Add Expense"}
              {selectedSite && <span className="block text-sm text-muted-foreground mt-1">{selectedSite.name}</span>}
            </DialogTitle>
            <DialogDescription className="text-sm">
              Enter the expense details below
            </DialogDescription>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 h-8 w-8"
              onClick={() => setAddDialogOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-4">
            {/* Form Fields - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expenseType" className="text-sm font-medium">Type *</Label>
                <Select value={formData.expenseType} onValueChange={(v) => setFormData({...formData, expenseType: v})} required>
                  <SelectTrigger className="w-full h-11 text-sm">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ExpenseTypes.map(type => (
                      <SelectItem key={type.value} value={type.value} className="text-sm">
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})} required>
                  <SelectTrigger className="w-full h-11 text-sm">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {ExpenseCategories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value} className="text-sm">
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter description"
                required
                rows={3}
                className="w-full text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="Amount"
                  min="0"
                  step="0.01"
                  required
                  className="w-full h-11 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  max={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full h-11 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendor" className="text-sm font-medium">Vendor *</Label>
                <Input
                  id="vendor"
                  value={formData.vendor}
                  onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                  placeholder="Vendor name"
                  required
                  className="w-full h-11 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod" className="text-sm font-medium">Payment Method *</Label>
              <Select value={formData.paymentMethod} onValueChange={(v) => setFormData({...formData, paymentMethod: v})} required>
                <SelectTrigger className="w-full h-11 text-sm">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {PaymentMethods.map(method => (
                    <SelectItem key={method.value} value={method.value} className="text-sm">
                      {method.icon} {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Fields - Responsive */}
            <div className="border rounded-lg p-4 space-y-3">
              <Label className="text-sm font-medium">Custom Fields</Label>
              
              {customFields.map((field, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                  <span className="flex-1 text-sm font-medium truncate">{field.fieldName}:</span>
                  <span className="flex-1 text-sm truncate">{field.fieldValue}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCustomField(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Field name"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="flex-1 h-11 text-sm"
                />
                <Input
                  placeholder="Field value"
                  value={newFieldValue}
                  onChange={(e) => setNewFieldValue(e.target.value)}
                  className="flex-1 h-11 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddCustomField}
                  disabled={!newFieldName || !newFieldValue}
                  className="h-11 text-sm whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add
                </Button>
              </div>
            </div>

            {/* Form Actions - Fixed at bottom on mobile */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 pb-2 sm:pb-0 sticky bottom-0 bg-background border-t sm:border-0 mt-4">
              <Button 
                type="submit" 
                className="w-full sm:flex-1 h-12 text-base font-medium order-2 sm:order-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editMode ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  editMode ? "Update Expense" : "Add Expense"
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setAddDialogOpen(false)}
                className="w-full sm:flex-1 h-12 text-base font-medium order-1 sm:order-2"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Site Expenses Dialog - Mobile Responsive */}
      <Dialog open={siteExpensesDialogOpen} onOpenChange={setSiteExpensesDialogOpen}>
        <DialogContent className="w-full max-w-full sm:max-w-5xl h-full sm:h-auto sm:max-h-[90vh] m-0 p-0 sm:p-6 rounded-none sm:rounded-lg overflow-hidden flex flex-col">
          <DialogHeader className="p-4 sm:p-6 pb-2 border-b sticky top-0 bg-background z-10">
            <DialogTitle className="text-lg sm:text-xl pr-8">
              Expenses - {selectedSite?.name}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 h-8 w-8"
              onClick={() => setSiteExpensesDialogOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {selectedSite && (
              <div className="space-y-3">
                {getSiteExpenses(selectedSite._id).length === 0 ? (
                  <div className="text-center py-12">
                    <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Expenses</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      No expenses recorded for this site yet
                    </p>
                    <Button size="default" onClick={() => {
                      setSiteExpensesDialogOpen(false);
                      handleAddExpense(selectedSite);
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Expense
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Mobile View */}
                    <div className="sm:hidden space-y-3">
                      {getSiteExpenses(selectedSite._id).map((expense) => (
                        <div key={expense._id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-base truncate">{expense.description}</div>
                              <div className="text-sm text-muted-foreground">{formatDate(expense.date)}</div>
                            </div>
                            <Badge variant="secondary" className="text-sm ml-2">
                              {getCategoryIcon(expense.category)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground block">Vendor</span>
                              <span className="font-medium">{expense.vendor}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block">Amount</span>
                              <span className="font-bold text-green-600">{formatCurrency(expense.amount)}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-muted-foreground block">Payment</span>
                              <span className="inline-flex items-center gap-1">
                                {getPaymentMethodIcon(expense.paymentMethod)} {expense.paymentMethod}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex justify-end gap-2 pt-2 border-t">
                            <Button variant="outline" size="sm" className="h-10 px-3 text-sm" onClick={() => handleViewExpense(expense)}>
                              <Eye className="h-4 w-4 mr-2" /> View
                            </Button>
                            <Button variant="outline" size="sm" className="h-10 px-3 text-sm" onClick={() => {
                              setSiteExpensesDialogOpen(false);
                              handleEditExpense(expense);
                            }}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </Button>
                            <Button variant="destructive" size="sm" className="h-10 px-3 text-sm" onClick={() => handleDeleteExpense(expense._id)}>
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop View */}
                    <div className="hidden sm:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="whitespace-nowrap">Date</TableHead>
                            <TableHead className="whitespace-nowrap">Description</TableHead>
                            <TableHead className="whitespace-nowrap">Category</TableHead>
                            <TableHead className="whitespace-nowrap">Vendor</TableHead>
                            <TableHead className="whitespace-nowrap">Payment</TableHead>
                            <TableHead className="whitespace-nowrap">Amount</TableHead>
                            <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getSiteExpenses(selectedSite._id).map((expense) => (
                            <TableRow key={expense._id}>
                              <TableCell className="whitespace-nowrap">{formatDate(expense.date)}</TableCell>
                              <TableCell className="max-w-[250px]">
                                <div className="font-medium truncate">{expense.description}</div>
                                <div className="text-xs text-muted-foreground">
                                  Type: {expense.expenseType}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="whitespace-nowrap">
                                  {getCategoryIcon(expense.category)} {expense.category.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell className="whitespace-nowrap">{expense.vendor}</TableCell>
                              <TableCell className="whitespace-nowrap">
                                {getPaymentMethodIcon(expense.paymentMethod)} {expense.paymentMethod}
                              </TableCell>
                              <TableCell className="whitespace-nowrap font-medium">{formatCurrency(expense.amount)}</TableCell>
                              <TableCell className="text-right whitespace-nowrap">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => handleViewExpense(expense)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => {
                                    setSiteExpensesDialogOpen(false);
                                    handleEditExpense(expense);
                                  }}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleDeleteExpense(expense._id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Monthly Summary Dialog - Mobile Responsive */}
      <Dialog open={monthlyDialogOpen} onOpenChange={setMonthlyDialogOpen}>
        <DialogContent className="w-full max-w-full sm:max-w-4xl h-full sm:h-auto sm:max-h-[90vh] m-0 p-0 sm:p-6 rounded-none sm:rounded-lg overflow-hidden flex flex-col">
          <DialogHeader className="p-4 sm:p-6 pb-2 border-b sticky top-0 bg-background z-10">
            <DialogTitle className="text-lg sm:text-xl pr-8">
              Monthly Summary - {selectedSite?.name}
            </DialogTitle>
            <DialogDescription className="text-sm">
              Click on any month to view detailed expenses
            </DialogDescription>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 h-8 w-8"
              onClick={() => setMonthlyDialogOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {selectedSite && (
              <div className="space-y-4">
                {/* Year Navigation - Mobile Friendly */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-semibold">{selectedYear}</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="default"
                      onClick={() => changeYear(-1)}
                      className="h-11 px-4 text-sm"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="default"
                      onClick={() => changeYear(1)}
                      className="h-11 px-4 text-sm"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>

                {monthlyExpenses.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Monthly Data</h3>
                    <p className="text-sm text-muted-foreground">
                      No expenses found for {selectedSite.name}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Monthly Summary Cards - Mobile View */}
                    <div className="sm:hidden space-y-3">
                      {monthlyExpenses
                        .filter(m => m.year === selectedYear)
                        .sort((a, b) => a.month - b.month)
                        .map((monthData) => (
                          <Card 
                            key={`${monthData.year}-${monthData.month}`} 
                            className="hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => {
                              handleViewMonthDetails(selectedSite, monthData.month, monthData.year);
                              setMonthlyDialogOpen(false);
                            }}
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-base">
                                  {getMonthName(monthData.month)} {monthData.year}
                                </h4>
                                <Badge variant="secondary" className="text-sm">
                                  {monthData.count} {monthData.count === 1 ? 'expense' : 'expenses'}
                                </Badge>
                              </div>
                              
                              <div className="text-xl font-bold text-green-600 mb-3">
                                {formatCurrency(monthData.totalAmount)}
                              </div>
                              
                              <div className="flex flex-wrap gap-1.5">
                                {monthData.categories.map((cat, idx) => (
                                  <Badge key={idx} variant="outline" className="text-sm py-1">
                                    {getCategoryIcon(cat)} {cat.replace('_', ' ')}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Month</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>Expenses</TableHead>
                            <TableHead>Categories</TableHead>
                            <TableHead>Total Amount</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {monthlyExpenses
                            .filter(m => m.year === selectedYear)
                            .sort((a, b) => a.month - b.month)
                            .map((monthData) => (
                              <TableRow 
                                key={`${monthData.year}-${monthData.month}`}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleViewMonthDetails(selectedSite, monthData.month, monthData.year)}
                              >
                                <TableCell className="font-medium">{getMonthName(monthData.month)}</TableCell>
                                <TableCell>{monthData.year}</TableCell>
                                <TableCell>
                                  <Badge variant="secondary">
                                    {monthData.count}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {monthData.categories.slice(0, 2).map((cat, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {getCategoryIcon(cat)}
                                      </Badge>
                                    ))}
                                    {monthData.categories.length > 2 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{monthData.categories.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium text-green-600">
                                  {formatCurrency(monthData.totalAmount)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewMonthDetails(selectedSite, monthData.month, monthData.year);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Month Details Dialog - Mobile Responsive */}
      <Dialog open={monthDetailsDialogOpen} onOpenChange={setMonthDetailsDialogOpen}>
        <DialogContent className="w-full max-w-full sm:max-w-5xl h-full sm:h-auto sm:max-h-[90vh] m-0 p-0 sm:p-6 rounded-none sm:rounded-lg overflow-hidden flex flex-col">
          <DialogHeader className="p-4 sm:p-6 pb-2 border-b sticky top-0 bg-background z-10">
            <DialogTitle className="text-lg sm:text-xl pr-8">
              {selectedMonth && `${getMonthName(selectedMonth.month)} ${selectedMonth.year} Expenses`}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {selectedMonth?.count} {selectedMonth?.count === 1 ? 'expense' : 'expenses'} totaling {selectedMonth && formatCurrency(selectedMonth.totalAmount)}
            </DialogDescription>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 h-8 w-8"
              onClick={() => setMonthDetailsDialogOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {selectedSite && selectedMonth && (
              <div className="space-y-4">
                {selectedMonth.expenses && selectedMonth.expenses.length > 0 ? (
                  <>
                    {/* Mobile View */}
                    <div className="sm:hidden space-y-3">
                      {selectedMonth.expenses.map((expense) => (
                        <div key={expense._id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-base truncate">{expense.description}</div>
                              <div className="text-sm text-muted-foreground">{formatDate(expense.date)}</div>
                            </div>
                            <Badge variant="secondary" className="text-sm ml-2">
                              {getCategoryIcon(expense.category)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground block">Vendor</span>
                              <span className="font-medium">{expense.vendor}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block">Amount</span>
                              <span className="font-bold text-green-600">{formatCurrency(expense.amount)}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-muted-foreground block">Payment</span>
                              <span className="inline-flex items-center gap-1">
                                {getPaymentMethodIcon(expense.paymentMethod)} {expense.paymentMethod}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex justify-end gap-2 pt-2 border-t">
                            <Button variant="outline" size="sm" className="h-10 px-3 text-sm" onClick={() => {
                              setMonthDetailsDialogOpen(false);
                              handleViewExpense(expense);
                            }}>
                              <Eye className="h-4 w-4 mr-2" /> View
                            </Button>
                            <Button variant="outline" size="sm" className="h-10 px-3 text-sm" onClick={() => {
                              setMonthDetailsDialogOpen(false);
                              handleEditExpense(expense);
                            }}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </Button>
                            <Button variant="destructive" size="sm" className="h-10 px-3 text-sm" onClick={() => handleDeleteExpense(expense._id)}>
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop View */}
                    <div className="hidden sm:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="whitespace-nowrap">Date</TableHead>
                            <TableHead className="whitespace-nowrap">Description</TableHead>
                            <TableHead className="whitespace-nowrap">Category</TableHead>
                            <TableHead className="whitespace-nowrap">Vendor</TableHead>
                            <TableHead className="whitespace-nowrap">Payment</TableHead>
                            <TableHead className="whitespace-nowrap">Amount</TableHead>
                            <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedMonth.expenses.map((expense) => (
                            <TableRow key={expense._id}>
                              <TableCell className="whitespace-nowrap">{formatDate(expense.date)}</TableCell>
                              <TableCell className="max-w-[250px]">
                                <div className="font-medium truncate">{expense.description}</div>
                                <div className="text-xs text-muted-foreground">
                                  Type: {expense.expenseType}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="whitespace-nowrap">
                                  {getCategoryIcon(expense.category)} {expense.category.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell className="whitespace-nowrap">{expense.vendor}</TableCell>
                              <TableCell className="whitespace-nowrap">
                                {getPaymentMethodIcon(expense.paymentMethod)} {expense.paymentMethod}
                              </TableCell>
                              <TableCell className="whitespace-nowrap font-medium">{formatCurrency(expense.amount)}</TableCell>
                              <TableCell className="text-right whitespace-nowrap">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => {
                                    setMonthDetailsDialogOpen(false);
                                    handleViewExpense(expense);
                                  }}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => {
                                    setMonthDetailsDialogOpen(false);
                                    handleEditExpense(expense);
                                  }}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleDeleteExpense(expense._id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Month Total - Mobile Friendly */}
                    <div className="flex justify-between sm:justify-end items-center gap-4 pt-4 border-t">
                      <span className="text-base sm:text-sm text-muted-foreground">
                        Total for {getMonthName(selectedMonth.month)}:
                      </span>
                      <span className="text-2xl sm:text-2xl font-bold text-green-600">
                        {formatCurrency(selectedMonth.totalAmount)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Expenses</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      No expenses found for {getMonthName(selectedMonth.month)} {selectedMonth.year}
                    </p>
                    <Button size="default" onClick={() => {
                      setMonthDetailsDialogOpen(false);
                      if (selectedSite) handleAddExpense(selectedSite);
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Expense
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* View Expense Dialog - Mobile Responsive */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="w-full max-w-full sm:max-w-2xl h-full sm:h-auto sm:max-h-[90vh] m-0 p-0 sm:p-6 rounded-none sm:rounded-lg overflow-hidden flex flex-col">
          <DialogHeader className="p-4 sm:p-6 pb-2 border-b sticky top-0 bg-background z-10">
            <DialogTitle className="text-lg sm:text-xl pr-8">Expense Details</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 h-8 w-8"
              onClick={() => setViewDialogOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {selectedExpense && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium text-base">{formatDate(selectedExpense.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-bold text-xl text-green-600">{formatCurrency(selectedExpense.amount)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium text-base break-words">{selectedExpense.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Site</p>
                    <p className="font-medium text-base break-words">
                      {typeof selectedExpense.siteId === 'object' 
                        ? selectedExpense.siteId.name 
                        : sites.find(s => s._id === selectedExpense.siteId)?.name || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vendor</p>
                    <p className="font-medium text-base break-words">{selectedExpense.vendor}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Expense Type</p>
                    <Badge variant="secondary" className="text-sm py-1 px-3">
                      {selectedExpense.expenseType}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Category</p>
                    <Badge variant="outline" className="text-sm py-1 px-3">
                      {getCategoryIcon(selectedExpense.category)} {selectedExpense.category.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                  <Badge variant="outline" className="text-sm py-1 px-3">
                    {getPaymentMethodIcon(selectedExpense.paymentMethod)} {selectedExpense.paymentMethod}
                  </Badge>
                </div>

                {selectedExpense.customFields && selectedExpense.customFields.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Custom Fields</p>
                    <div className="space-y-2">
                      {selectedExpense.customFields.map((field, index) => (
                        <div key={index} className="p-3 bg-muted/30 rounded-lg text-sm">
                          <span className="font-medium">{field.fieldName}:</span> {field.fieldValue}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-sm text-muted-foreground border-t pt-3">
                  Created: {new Date(selectedExpense.createdAt).toLocaleString()}
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setViewDialogOpen(false);
                      handleEditExpense(selectedExpense);
                    }}
                    className="w-full sm:w-auto h-12 text-base"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setViewDialogOpen(false);
                      handleDeleteExpense(selectedExpense._id);
                    }}
                    className="w-full sm:w-auto h-12 text-base"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpensesSection;