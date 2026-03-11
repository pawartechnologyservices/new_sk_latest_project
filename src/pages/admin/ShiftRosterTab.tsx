import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Clock, Users, Calendar, Plus, CheckCircle } from "lucide-react";
import { Trash2, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { shiftService } from "@/services/ShiftService";

// Interfaces (can also be imported from types file)
interface Shift {
  _id: string;
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  employees: string[];
  createdAt: string;
  updatedAt: string;
}

interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  department: string;
  status: string;
}

const ShiftRosterTab = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState({
    shifts: false,
    employees: false,
    creating: false,
    deleting: false,
    assigning: false
  });
  const [newShift, setNewShift] = useState({
    name: "",
    startTime: "06:00",
    endTime: "14:00",
    employees: [] as string[]
  });

  // Fetch shifts and employees from backend
  useEffect(() => {
    fetchShifts();
    fetchEmployees();
  }, []);

  const fetchShifts = async () => {
    setLoading(prev => ({ ...prev, shifts: true }));
    try {
      const shiftsData = await shiftService.getAllShifts();
      setShifts(shiftsData);
    } catch (error: any) {
      console.error("Error fetching shifts:", error);
      toast.error(`Error fetching shifts: ${error.message}. Make sure backend is running on port 5001.`);
    } finally {
      setLoading(prev => ({ ...prev, shifts: false }));
    }
  };

  const fetchEmployees = async () => {
    setLoading(prev => ({ ...prev, employees: true }));
    try {
      const activeEmployees = await shiftService.getActiveEmployees();
      setEmployees(activeEmployees);
    } catch (error: any) {
      console.error("Error fetching employees:", error);
      toast.error(`Error fetching employees: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, employees: false }));
    }
  };

  const handleAddShift = async () => {
    if (!newShift.name.trim()) {
      toast.error("Please enter shift name");
      return;
    }

    setLoading(prev => ({ ...prev, creating: true }));
    try {
      const createdShift = await shiftService.createShift(newShift);
      setShifts(prev => [...prev, createdShift]);
      setNewShift({ 
        name: "", 
        startTime: "06:00", 
        endTime: "14:00", 
        employees: [] 
      });
      toast.success("Shift created successfully!");
    } catch (error: any) {
      console.error("Error creating shift:", error);
      toast.error(`Error creating shift: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, creating: false }));
    }
  };

  const handleAssignEmployee = async (shiftId: string, employeeId: string) => {
    setLoading(prev => ({ ...prev, assigning: true }));
    try {
      await shiftService.assignEmployeeToShift(shiftId, employeeId);
      fetchShifts(); // Refresh shifts
      toast.success("Employee assigned successfully!");
    } catch (error: any) {
      console.error("Error assigning employee:", error);
      toast.error(`Error assigning employee: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, assigning: false }));
    }
  };

  const handleRemoveEmployee = async (shiftId: string, employeeId: string) => {
    try {
      await shiftService.removeEmployeeFromShift(shiftId, employeeId);
      fetchShifts(); // Refresh shifts
      toast.success("Employee removed successfully!");
    } catch (error: any) {
      console.error("Error removing employee:", error);
      toast.error(`Error removing employee: ${error.message}`);
    }
  };

  const handleDeleteShift = async (shiftId: string) => {
    if (!confirm("Are you sure you want to delete this shift?")) return;

    setLoading(prev => ({ ...prev, deleting: true }));
    try {
      await shiftService.deleteShift(shiftId);
      setShifts(prev => prev.filter(shift => shift._id !== shiftId));
      toast.success("Shift deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting shift:", error);
      toast.error(`Error deleting shift: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, deleting: false }));
    }
  };

  const refreshAll = async () => {
    setLoading(prev => ({ ...prev, shifts: true, employees: true }));
    try {
      await Promise.all([fetchShifts(), fetchEmployees()]);
      toast.success("Data refreshed successfully!");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Error refreshing data");
    } finally {
      setLoading(prev => ({ ...prev, shifts: false, employees: false }));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getEmployeeName = (employeeId: string) => {
    const emp = employees.find(e => e.employeeId === employeeId);
    return emp ? emp.name : employeeId;
  };

  const getEmployeeDetails = (employeeId: string) => {
    const emp = employees.find(e => e.employeeId === employeeId);
    return emp;
  };

  const getAvailableEmployeesForShift = (shift: Shift) => {
    return employees.filter(emp => !shift.employees.includes(emp.employeeId));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="border shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">Shift & Roster Management</CardTitle>
              <p className="text-xs sm:text-sm text-gray-600">Create, manage and assign shifts to employees</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm">
                  <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                  <span className="hidden xs:inline">{shifts.length} {shifts.length === 1 ? 'Shift' : 'Shifts'}</span>
                  <span className="xs:hidden">{shifts.length}</span>
                </Badge>
                <Badge variant="outline" className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm">
                  <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                  <span className="hidden xs:inline">{employees.length} Employees</span>
                  <span className="xs:hidden">{employees.length}</span>
                </Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshAll}
                disabled={loading.shifts || loading.employees}
                className="h-8 sm:h-9 text-xs sm:text-sm w-full sm:w-auto"
              >
                <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${loading.shifts ? 'animate-spin' : ''}`} />
                <span className="xs:inline">Refresh</span>
                <span className="hidden sm:inline ml-1">All</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <Tabs defaultValue="create" className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Create</span>
              </TabsTrigger>
              <TabsTrigger value="manage" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Manage</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-4 sm:space-y-6">
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                {/* Create Shift Section */}
                <Card className="border shadow-sm overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      Create New Shift
                    </CardTitle>
                    <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs w-fit">Step 1</Badge>
                      <span className="text-xs text-gray-600">Define shift details and assign employees</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="space-y-1.5 sm:space-y-2.5">
                        <Label htmlFor="shiftName" className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                          Shift Name
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                          id="shiftName" 
                          placeholder="e.g., Morning Shift, Night Shift" 
                          value={newShift.name}
                          onChange={(e) => setNewShift({...newShift, name: e.target.value})}
                          disabled={loading.creating}
                          className="h-9 sm:h-11 bg-white border-gray-300 focus:border-blue-500 text-sm"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                        <div className="space-y-1.5 sm:space-y-2.5">
                          <Label htmlFor="startTime" className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                            Start Time
                            <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Clock className="absolute left-2 sm:left-3 top-2 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                            <Input 
                              id="startTime" 
                              type="time" 
                              value={newShift.startTime}
                              onChange={(e) => setNewShift({...newShift, startTime: e.target.value})}
                              disabled={loading.creating}
                              className="h-9 sm:h-11 pl-8 sm:pl-10 bg-white border-gray-300 text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2.5">
                          <Label htmlFor="endTime" className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                            End Time
                            <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Clock className="absolute left-2 sm:left-3 top-2 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                            <Input 
                              id="endTime" 
                              type="time" 
                              value={newShift.endTime}
                              onChange={(e) => setNewShift({...newShift, endTime: e.target.value})}
                              disabled={loading.creating}
                              className="h-9 sm:h-11 pl-8 sm:pl-10 bg-white border-gray-300 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <Separator className="my-3 sm:my-4" />
                      
                      <div className="space-y-2 sm:space-y-3">
                        <Label className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                          Assign Employees (Optional)
                        </Label>
                        <Select 
                          onValueChange={(value) => {
                            if (!newShift.employees.includes(value)) {
                              setNewShift({
                                ...newShift, 
                                employees: [...newShift.employees, value]
                              });
                            }
                          }}
                          disabled={loading.creating || loading.employees}
                        >
                          <SelectTrigger className="h-9 sm:h-11 bg-white border-gray-300 text-sm">
                            <SelectValue placeholder="Select employees to assign" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {loading.employees ? (
                              <div className="flex justify-center p-4">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : employees.length === 0 ? (
                              <div className="text-center p-4 text-sm text-gray-500">
                                <AlertCircle className="h-5 w-5 mx-auto mb-2" />
                                No active employees found
                              </div>
                            ) : (
                              employees.map(emp => (
                                <SelectItem 
                                  key={emp._id} 
                                  value={emp.employeeId}
                                  disabled={newShift.employees.includes(emp.employeeId)}
                                  className="py-2 sm:py-2.5 text-sm"
                                >
                                  <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2">
                                    <div className="flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                                      <span className="font-medium truncate max-w-[120px] xs:max-w-none">{emp.name}</span>
                                    </div>
                                    <Badge variant="outline" className="text-xs w-fit xs:ml-auto">
                                      {emp.department}
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-0.5 xs:hidden">{emp.employeeId}</div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        
                        {newShift.employees.length > 0 && (
                          <div className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
                            <Label className="text-xs sm:text-sm font-semibold text-gray-700">
                              Selected Employees ({newShift.employees.length})
                            </Label>
                            <div className="space-y-2 max-h-40 sm:max-h-48 overflow-y-auto p-2 sm:p-3 border rounded-lg bg-gray-50">
                              {newShift.employees.map(empId => {
                                const emp = getEmployeeDetails(empId);
                                return (
                                  <div key={empId} className="flex justify-between items-center p-2 sm:p-3 border rounded-md bg-white hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="font-medium text-sm sm:text-base truncate">{emp?.name || empId}</div>
                                        <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 mt-0.5 sm:mt-1">
                                          <span className="text-xs text-gray-500 truncate">{empId}</span>
                                          {emp?.department && (
                                            <Badge variant="secondary" className="text-xs w-fit">
                                              {emp.department}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-red-50 flex-shrink-0 ml-1 sm:ml-2"
                                      onClick={() => setNewShift({
                                        ...newShift,
                                        employees: newShift.employees.filter(id => id !== empId)
                                      })}
                                      disabled={loading.creating}
                                    >
                                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleAddShift} 
                      disabled={loading.creating || !newShift.name.trim()}
                      className="w-full h-9 sm:h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-sm sm:text-base"
                      size="lg"
                    >
                      {loading.creating ? (
                        <>
                          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                          Creating Shift...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Create Shift
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
                
                {/* Current Shifts Preview */}
                <Card className="border shadow-sm overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
                      Current Shifts Preview
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {loading.shifts ? "Loading..." : `${shifts.length} active shifts`}
                      </Badge>
                      {loading.employees && (
                        <Badge variant="secondary" className="text-xs animate-pulse">
                          Loading Employees...
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    {loading.shifts ? (
                      <div className="flex flex-col items-center justify-center h-48 sm:h-64">
                        <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-blue-600 mb-3 sm:mb-4" />
                        <p className="text-sm sm:text-base text-gray-600">Loading shifts...</p>
                      </div>
                    ) : shifts.length === 0 ? (
                      <div className="text-center p-4 sm:p-8 border-2 border-dashed rounded-xl bg-gradient-to-b from-gray-50 to-white">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                          <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">No shifts created yet</h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Create your first shift to get started</p>
                        <Button 
                          variant="outline" 
                          onClick={refreshAll}
                          className="gap-2 text-sm h-8 sm:h-10"
                        >
                          <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                          Refresh Data
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-1 sm:pr-2">
                        {shifts.slice(0, 3).map((shift) => (
                          <div key={shift._id} className="border rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-3 sm:space-y-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col xs:flex-row xs:justify-between xs:items-start gap-2">
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                  <h4 className="font-bold text-base sm:text-lg text-gray-800">{shift.name}</h4>
                                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                    <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                                    {shift.startTime} - {shift.endTime}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                                  <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                                  <span className="truncate">Created {formatDate(shift.createdAt)}</span>
                                </div>
                              </div>
                              <Badge variant="outline" className="bg-gray-50 text-xs w-fit xs:w-auto">
                                <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                                {shift.employees.length} assigned
                              </Badge>
                            </div>
                            
                            {shift.employees.length > 0 && (
                              <div className="space-y-1.5 sm:space-y-2">
                                <Label className="text-xs sm:text-sm font-semibold text-gray-700">Assigned Team</Label>
                                <div className="space-y-1.5 sm:space-y-2">
                                  {shift.employees.slice(0, 2).map(empId => {
                                    const emp = getEmployeeDetails(empId);
                                    return (
                                      <div key={empId} className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 border rounded-lg bg-gray-50">
                                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                          <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium text-xs sm:text-sm truncate">{emp?.name || empId}</div>
                                          <div className="flex flex-col xs:flex-row xs:items-center gap-0.5 xs:gap-2 mt-0.5">
                                            <span className="text-xs text-gray-500 truncate">{empId}</span>
                                            {emp?.department && (
                                              <Badge variant="secondary" className="text-xs w-fit">
                                                {emp.department}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  {shift.employees.length > 2 && (
                                    <div className="text-center py-1 sm:py-2 text-xs sm:text-sm text-gray-500">
                                      + {shift.employees.length - 2} more employees
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        {shifts.length > 3 && (
                          <div className="text-center pt-3 sm:pt-4 border-t">
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm">
                              View all {shifts.length} shifts →
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="manage" className="space-y-4 sm:space-y-6">
              <Card className="border shadow-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
                      All Shifts Management
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs">
                        Total: {shifts.length} shifts
                      </Badge>
                      <Badge variant="outline" className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs">
                        Employees: {employees.length}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  {loading.shifts ? (
                    <div className="flex flex-col items-center justify-center h-64 sm:h-96">
                      <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin text-blue-600 mb-3 sm:mb-4" />
                      <p className="text-sm sm:text-base text-gray-600">Loading shift data...</p>
                    </div>
                  ) : shifts.length === 0 ? (
                    <div className="text-center p-6 sm:p-12 border-2 border-dashed rounded-xl bg-gradient-to-b from-gray-50 to-white">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">No shifts available</h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto">
                        Create your first shift to start managing employee schedules and assignments.
                      </p>
                      <Button 
                        onClick={() => {
                          const createTab = document.querySelector('[data-value="create"]') as HTMLElement;
                          if (createTab) createTab.click();
                        }}
                        className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-sm h-9 sm:h-10"
                      >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        Create First Shift
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {shifts.map((shift) => (
                        <Card key={shift._id} className="border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                          <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
                            <div className="flex justify-between items-start gap-2">
                              <CardTitle className="text-base sm:text-lg font-bold text-gray-800 truncate flex-1">{shift.name}</CardTitle>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                onClick={() => handleDeleteShift(shift._id)}
                                disabled={loading.deleting}
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                              <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                                {shift.startTime} - {shift.endTime}
                              </Badge>
                              <Badge variant="outline" className="bg-gray-50 text-xs">
                                <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                                {shift.employees.length}
                              </Badge>
                            </div>
                          </CardHeader>
                          <Separator />
                          <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex justify-between text-xs sm:text-sm">
                                <span className="text-gray-600">Created</span>
                                <span className="font-medium">{formatDate(shift.createdAt)}</span>
                              </div>
                              
                              {shift.employees.length > 0 && (
                                <div className="space-y-1.5 sm:space-y-2">
                                  <Label className="text-xs sm:text-sm font-semibold text-gray-700">Assigned Employees</Label>
                                  <div className="space-y-1.5 sm:space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                                    {shift.employees.map(empId => {
                                      const emp = getEmployeeDetails(empId);
                                      return (
                                        <div key={empId} className="flex justify-between items-center p-1.5 sm:p-2 border rounded bg-gray-50 hover:bg-gray-100">
                                          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                                            <div className="min-w-0 flex-1">
                                              <div className="text-xs sm:text-sm font-medium truncate">{emp?.name || empId}</div>
                                              <div className="flex flex-wrap items-center gap-0.5 sm:gap-1 mt-0.5">
                                                <span className="text-xs text-gray-500 truncate max-w-[60px] sm:max-w-none">{empId}</span>
                                                {emp?.department && (
                                                  <Badge variant="outline" className="text-xs">
                                                    {emp.department}
                                                  </Badge>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-red-50 flex-shrink-0"
                                            onClick={() => handleRemoveEmployee(shift._id, empId)}
                                            disabled={loading.assigning}
                                          >
                                            <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-500" />
                                          </Button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                              
                              <div className="pt-1 sm:pt-2">
                                <Select 
                                  onValueChange={(value) => handleAssignEmployee(shift._id, value)}
                                  disabled={loading.shifts || loading.employees || loading.assigning}
                                >
                                  <SelectTrigger className="h-8 sm:h-9 bg-white text-xs sm:text-sm">
                                    <SelectValue placeholder="Add employee" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {loading.employees ? (
                                      <div className="flex justify-center p-4">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      </div>
                                    ) : employees.length === 0 ? (
                                      <div className="text-center p-4 text-sm text-gray-500">
                                        No employees available
                                      </div>
                                    ) : (
                                      getAvailableEmployeesForShift(shift).map(emp => (
                                        <SelectItem key={emp._id} value={emp.employeeId} className="text-xs sm:text-sm">
                                          <div className="flex items-center gap-1.5 sm:gap-2">
                                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                                            <span className="truncate max-w-[100px] sm:max-w-none">{emp.name}</span>
                                            <Badge variant="outline" className="ml-auto text-xs">
                                              {emp.department}
                                            </Badge>
                                          </div>
                                        </SelectItem>
                                      ))
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShiftRosterTab;