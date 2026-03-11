// src/services/assignTaskService.ts
import { AssignedUser } from './TaskService';

export interface AssignTask {
  _id: string;
  taskTitle: string;
  description: string;
  startDate: string;
  endDate: string;
  dueDateTime: string;
  priority: 'high' | 'medium' | 'low';
  taskType: string;
  siteId: string;
  siteName: string;
  siteLocation: string;
  clientName: string;
  assignedManagers: AssignedUser[];
  assignedSupervisors: AssignedUser[];
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  hourlyUpdates: HourlyUpdate[];
  attachments: Attachment[];
  completionNotes?: string;
  completionPercentage: number;
  isOverdue?: boolean;
  daysUntilDue?: number;
}

export interface HourlyUpdate {
  id: string;
  timestamp: string;
  content: string;
  submittedBy: string;
  submittedByName: string;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  uploadedAt: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedByName: string;
}

export interface CreateAssignTaskRequest {
  taskTitle: string;
  description: string;
  startDate: string;
  endDate: string;
  dueDateTime: string;
  priority: 'high' | 'medium' | 'low';
  taskType: string;
  siteId: string;
  siteName: string;
  siteLocation: string;
  clientName: string;
  assignedManagers: Omit<AssignedUser, 'assignedAt' | 'status'>[];
  assignedSupervisors: Omit<AssignedUser, 'assignedAt' | 'status'>[];
  createdBy: string;
  createdByName: string;
}

export interface UpdateAssignTaskRequest {
  taskTitle?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  dueDateTime?: string;
  priority?: 'high' | 'medium' | 'low';
  taskType?: string;
  siteId?: string;
  siteName?: string;
  siteLocation?: string;
  clientName?: string;
  assignedManagers?: AssignedUser[];
  assignedSupervisors?: AssignedUser[];
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  completionNotes?: string;
  completionPercentage?: number;
}

export interface UpdateStatusRequest {
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  userId?: string;
  userRole?: 'manager' | 'supervisor';
}

export interface AddHourlyUpdateRequest {
  content: string;
  submittedBy: string;
  submittedByName: string;
}

export interface AddAttachmentRequest {
  filename: string;
  url: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedByName: string;
}

export interface BulkCreateTasksRequest {
  tasks: CreateAssignTaskRequest[];
  createdBy: string;
  createdByName: string;
}

export interface PaginatedResponse {
  tasks: AssignTask[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const API_URL = `http://${window.location.hostname}:5001/api/assign-tasks`;

class AssignTaskService {
  
  // Get all assign tasks with optional filters
  async getAllAssignTasks(params?: {
    status?: string;
    priority?: string;
    siteId?: string;
    taskType?: string;
    managerId?: string;
    supervisorId?: string;
    overdue?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    page?: number;
  }): Promise<PaginatedResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }
      
      const url = `${API_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('📋 Fetching assign tasks from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch assign tasks: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ Fetched ${data.tasks?.length || 0} assign tasks`);
      return data;
      
    } catch (error) {
      console.error('❌ Error fetching assign tasks:', error);
      throw error;
    }
  }

  // Get assign task by ID
  async getAssignTaskById(taskId: string): Promise<AssignTask | null> {
    try {
      const response = await fetch(`${API_URL}/${taskId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch assign task: ${response.status}`);
      }
      
      return await response.json();
      
    } catch (error) {
      console.error(`❌ Error fetching assign task ${taskId}:`, error);
      throw error;
    }
  }

  // Create new assign task
  async createAssignTask(taskData: CreateAssignTaskRequest): Promise<AssignTask> {
    try {
      console.log('📝 Sending create assign task request to:', API_URL);
      console.log('📦 Task data:', JSON.stringify(taskData, null, 2));
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      
      const responseText = await response.text();
      console.log('📨 Response status:', response.status);
      console.log('📨 Response body:', responseText);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText || `Failed to create assign task: ${response.status}` };
        }
        console.error('❌ Server error response:', errorData);
        throw new Error(errorData.message || `Failed to create assign task: ${response.status}`);
      }
      
      const result = JSON.parse(responseText);
      console.log('✅ Assign task created successfully:', result);
      return result.task || result;
      
    } catch (error) {
      console.error('❌ Error creating assign task:', error);
      throw error;
    }
  }

  // Update assign task
  async updateAssignTask(taskId: string, updateData: UpdateAssignTaskRequest): Promise<AssignTask> {
    try {
      console.log(`🔄 Updating assign task ${taskId}:`, JSON.stringify(updateData, null, 2));
      
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update assign task: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Assign task updated successfully:', result);
      return result.task || result;
      
    } catch (error) {
      console.error(`❌ Error updating assign task ${taskId}:`, error);
      throw error;
    }
  }

  // Update task status
  async updateTaskStatus(taskId: string, statusData: UpdateStatusRequest): Promise<AssignTask> {
    try {
      const response = await fetch(`${API_URL}/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(statusData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update task status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Task status updated successfully:', result);
      return result.task || result;
      
    } catch (error) {
      console.error(`❌ Error updating task ${taskId} status:`, error);
      throw error;
    }
  }

  // Delete assign task
  async deleteAssignTask(taskId: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete assign task: ${response.status}`);
      }
      
      console.log(`✅ Assign task ${taskId} deleted successfully`);
      
    } catch (error) {
      console.error(`❌ Error deleting assign task ${taskId}:`, error);
      throw error;
    }
  }

  // Add hourly update
  async addHourlyUpdate(taskId: string, updateData: AddHourlyUpdateRequest): Promise<HourlyUpdate> {
    try {
      const response = await fetch(`${API_URL}/${taskId}/hourly-updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to add hourly update: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Hourly update added successfully:', result);
      return result.update || result;
      
    } catch (error) {
      console.error(`❌ Error adding hourly update to task ${taskId}:`, error);
      throw error;
    }
  }

  // Add attachment
  async addAttachment(taskId: string, attachmentData: AddAttachmentRequest): Promise<Attachment> {
    try {
      const response = await fetch(`${API_URL}/${taskId}/attachments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attachmentData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to add attachment: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Attachment added successfully:', result);
      return result.attachment || result;
      
    } catch (error) {
      console.error(`❌ Error adding attachment to task ${taskId}:`, error);
      throw error;
    }
  }

  // Delete attachment
  async deleteAttachment(taskId: string, attachmentId: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/${taskId}/attachments/${attachmentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete attachment: ${response.status}`);
      }
      
      console.log(`✅ Attachment ${attachmentId} deleted successfully`);
      
    } catch (error) {
      console.error(`❌ Error deleting attachment ${attachmentId}:`, error);
      throw error;
    }
  }

  // Get task statistics
  async getTaskStatistics() {
    try {
      const response = await fetch(`${API_URL}/stats`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch task statistics: ${response.status}`);
      }
      
      return await response.json();
      
    } catch (error) {
      console.error('❌ Error fetching task statistics:', error);
      throw error;
    }
  }

  // Search tasks
  async searchTasks(query: string, filters?: {
    status?: string;
    priority?: string;
    siteId?: string;
    taskType?: string;
  }): Promise<AssignTask[]> {
    try {
      const queryParams = new URLSearchParams({ query });
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
      }
      
      const response = await fetch(`${API_URL}/search?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to search tasks: ${response.status}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
      
    } catch (error) {
      console.error('❌ Error searching tasks:', error);
      throw error;
    }
  }

  // Get tasks by site
  async getTasksBySite(siteId: string): Promise<AssignTask[]> {
    try {
      const response = await fetch(`${API_URL}/site/${siteId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks by site: ${response.status}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
      
    } catch (error) {
      console.error(`❌ Error fetching tasks for site ${siteId}:`, error);
      throw error;
    }
  }

  // Get tasks by manager
  async getTasksByManager(managerId: string): Promise<AssignTask[]> {
    try {
      const response = await fetch(`${API_URL}/manager/${managerId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks by manager: ${response.status}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
      
    } catch (error) {
      console.error(`❌ Error fetching tasks for manager ${managerId}:`, error);
      throw error;
    }
  }

  // Get tasks by supervisor
  async getTasksBySupervisor(supervisorId: string): Promise<AssignTask[]> {
    try {
      const response = await fetch(`${API_URL}/supervisor/${supervisorId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks by supervisor: ${response.status}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
      
    } catch (error) {
      console.error(`❌ Error fetching tasks for supervisor ${supervisorId}:`, error);
      throw error;
    }
  }

  // Create bulk tasks
  async createBulkTasks(bulkData: BulkCreateTasksRequest): Promise<AssignTask[]> {
    try {
      console.log('📝 Creating bulk assign tasks:', JSON.stringify(bulkData, null, 2));
      
      const response = await fetch(`${API_URL}/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bulkData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create bulk tasks: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Bulk tasks created successfully:', result);
      return result.tasks || result;
      
    } catch (error) {
      console.error('❌ Error creating bulk tasks:', error);
      throw error;
    }
  }

  // Utility: Format date
  formatDate(dateString: string): string {
    if (!dateString) return 'No date set';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  }

  // Utility: Get priority color
  getPriorityColor(priority: string): 'destructive' | 'default' | 'secondary' | 'outline' {
    const colors: Record<string, 'destructive' | 'default' | 'secondary' | 'outline'> = { 
      high: 'destructive', 
      medium: 'default', 
      low: 'secondary' 
    };
    return colors[priority] || 'default';
  }

  // Utility: Get status color
  getStatusColor(status: string): 'default' | 'destructive' | 'secondary' | 'outline' {
    const colors: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = { 
      completed: 'default', 
      'in-progress': 'default', 
      pending: 'secondary',
      cancelled: 'destructive'
    };
    return colors[status] || 'default';
  }

  // Utility: Check if task is overdue
  isOverdue(task: AssignTask): boolean {
    if (task.status === 'completed' || task.status === 'cancelled') return false;
    const dueDate = new Date(task.dueDateTime);
    const now = new Date();
    return dueDate < now;
  }

  // Utility: Get days until due
  getDaysUntilDue(task: AssignTask): number {
    const dueDate = new Date(task.dueDateTime);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Utility: Get all assigned staff names
  getAssignedStaffNames(task: AssignTask): string[] {
    const managerNames = task.assignedManagers?.map(m => m.name) || [];
    const supervisorNames = task.assignedSupervisors?.map(s => s.name) || [];
    return [...managerNames, ...supervisorNames];
  }

  // Utility: Get completion status text
  getCompletionStatus(task: AssignTask): string {
    if (task.status === 'completed') return 'Completed';
    if (task.status === 'cancelled') return 'Cancelled';
    
    const completedCount = [
      ...(task.assignedManagers || []),
      ...(task.assignedSupervisors || [])
    ].filter(u => u.status === 'completed').length;
    
    const totalCount = [
      ...(task.assignedManagers || []),
      ...(task.assignedSupervisors || [])
    ].length;
    
    if (totalCount === 0) return 'No staff assigned';
    return `${completedCount}/${totalCount} completed`;
  }
}

export const assignTaskService = new AssignTaskService();
export default assignTaskService;