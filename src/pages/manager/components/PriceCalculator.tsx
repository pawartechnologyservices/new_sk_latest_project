import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Calendar, 
  Clock, 
  Users, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  File, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye,
  Edit,
  Trash2,
  Upload,
  CalendarDays,
  Clock4,
  User,
  Building,
  Target,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  CheckSquare,
  Square
} from "lucide-react";
import { format } from 'date-fns';

// Types
interface TrainingSession {
  id: string;
  title: string;
  description: string;
  type: 'safety' | 'technical' | 'soft_skills' | 'compliance' | 'other';
  date: string;
  time: string;
  duration: string;
  trainer: string;
  supervisor: string;
  site: string;
  department: string;
  attendees: string[];
  maxAttendees: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  attachments: Attachment[];
  feedback: Feedback[];
  location: string;
  objectives: string[];
}

interface StaffBriefing {
  id: string;
  date: string;
  time: string;
  conductedBy: string;
  site: string;
  department: string;
  attendeesCount: number;
  topics: string[];
  keyPoints: string[];
  actionItems: ActionItem[];
  attachments: Attachment[];
  notes: string;
  shift: 'morning' | 'evening' | 'night';
}

interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video';
  url: string;
  size: string;
  uploadedAt: string;
}

interface Feedback {
  id: string;
  employeeId: string;
  employeeName: string;
  rating: number;
  comment: string;
  submittedAt: string;
}

interface ActionItem {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

// Sample data
const initialTrainingSessions: TrainingSession[] = [
  {
    id: 'TRN001',
    title: 'Fire Safety Training',
    description: 'Comprehensive fire safety training covering evacuation procedures, fire extinguisher usage, and emergency response protocols.',
    type: 'safety',
    date: '2024-12-15',
    time: '10:00 AM',
    duration: '3 hours',
    trainer: 'John Safety Officer',
    supervisor: 'Manager Smith',
    site: 'Main Building',
    department: 'All Departments',
    attendees: ['EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005'],
    maxAttendees: 20,
    status: 'scheduled',
    attachments: [
      { id: 'ATT001', name: 'fire_safety_manual.pdf', type: 'document', url: '#', size: '2.4 MB', uploadedAt: '2024-12-01' },
      { id: 'ATT002', name: 'evacuation_plan.jpg', type: 'image', url: '#', size: '1.2 MB', uploadedAt: '2024-12-01' }
    ],
    feedback: [],
    location: 'Main Conference Room',
    objectives: ['Understand fire safety protocols', 'Learn evacuation procedures', 'Practice fire extinguisher usage']
  },
  {
    id: 'TRN002',
    title: 'Equipment Operation Training',
    description: 'Training on proper operation and maintenance of heavy machinery and equipment.',
    type: 'technical',
    date: '2024-12-10',
    time: '09:00 AM',
    duration: '4 hours',
    trainer: 'Robert Engineer',
    supervisor: 'Supervisor Lee',
    site: 'Warehouse',
    department: 'Operations',
    attendees: ['EMP006', 'EMP007', 'EMP008'],
    maxAttendees: 15,
    status: 'ongoing',
    attachments: [
      { id: 'ATT003', name: 'equipment_manual.pdf', type: 'document', url: '#', size: '3.1 MB', uploadedAt: '2024-12-05' },
      { id: 'ATT004', name: 'safety_video.mp4', type: 'video', url: '#', size: '45 MB', uploadedAt: '2024-12-05' }
    ],
    feedback: [
      { id: 'FB001', employeeId: 'EMP006', employeeName: 'Mike Johnson', rating: 4, comment: 'Very informative session', submittedAt: '2024-12-10' }
    ],
    location: 'Equipment Room',
    objectives: ['Safe equipment operation', 'Basic troubleshooting', 'Preventive maintenance']
  },
  {
    id: 'TRN003',
    title: 'Customer Service Excellence',
    description: 'Enhancing customer service skills and handling difficult customer situations.',
    type: 'soft_skills',
    date: '2024-12-05',
    time: '02:00 PM',
    duration: '2 hours',
    trainer: 'Sarah Customer Manager',
    supervisor: 'Manager Garcia',
    site: 'Admin Block',
    department: 'Front Desk',
    attendees: ['EMP009', 'EMP010', 'EMP011', 'EMP012'],
    maxAttendees: 12,
    status: 'completed',
    attachments: [
      { id: 'ATT005', name: 'customer_service_guide.pdf', type: 'document', url: '#', size: '1.8 MB', uploadedAt: '2024-12-01' }
    ],
    feedback: [
      { id: 'FB002', employeeId: 'EMP009', employeeName: 'Lisa Brown', rating: 5, comment: 'Excellent training material', submittedAt: '2024-12-05' },
      { id: 'FB003', employeeId: 'EMP010', employeeName: 'David Wilson', rating: 4, comment: 'Good practical examples', submittedAt: '2024-12-05' }
    ],
    location: 'Training Room A',
    objectives: ['Improve communication skills', 'Handle complaints effectively', 'Build customer relationships']
  }
];

const initialStaffBriefings: StaffBriefing[] = [
  {
    id: 'BRI001',
    date: '2024-12-12',
    time: '08:00 AM',
    conductedBy: 'Manager Smith',
    site: 'Main Building',
    department: 'Housekeeping',
    attendeesCount: 25,
    topics: ['Daily tasks allocation', 'Safety reminders', 'Quality standards'],
    keyPoints: ['Focus on common areas', 'Check equipment before use', 'Report any issues immediately'],
    actionItems: [
      { id: 'ACT001', description: 'Clean lobby area', assignedTo: 'Team A', dueDate: '2024-12-12', status: 'completed', priority: 'high' },
      { id: 'ACT002', description: 'Inspect cleaning equipment', assignedTo: 'Team B', dueDate: '2024-12-13', status: 'pending', priority: 'medium' }
    ],
    attachments: [
      { id: 'ATT006', name: 'briefing_notes.pdf', type: 'document', url: '#', size: '0.8 MB', uploadedAt: '2024-12-12' },
      { id: 'ATT007', name: 'team_photo.jpg', type: 'image', url: '#', size: '2.1 MB', uploadedAt: '2024-12-12' }
    ],
    notes: 'All team members present. Emphasized on maintaining hygiene standards.',
    shift: 'morning'
  },
  {
    id: 'BRI002',
    date: '2024-12-11',
    time: '04:00 PM',
    conductedBy: 'Supervisor Lee',
    site: 'Parking Area',
    department: 'Security',
    attendeesCount: 8,
    topics: ['Night shift protocols', 'Security checks', 'Emergency procedures'],
    keyPoints: ['Regular patrol rounds', 'Monitor CCTV cameras', 'Report suspicious activities'],
    actionItems: [
      { id: 'ACT003', description: 'Check all emergency exits', assignedTo: 'Night Team', dueDate: '2024-12-11', status: 'completed', priority: 'high' }
    ],
    attachments: [
      { id: 'ATT008', name: 'security_checklist.pdf', type: 'document', url: '#', size: '1.1 MB', uploadedAt: '2024-12-11' }
    ],
    notes: 'Briefing for night shift team. All equipment checked and functional.',
    shift: 'evening'
  },
  {
    id: 'BRI003',
    date: '2024-12-10',
    time: '10:00 PM',
    conductedBy: 'Manager Garcia',
    site: 'IT Building',
    department: 'Maintenance',
    attendeesCount: 6,
    topics: ['Equipment maintenance', 'Safety protocols', 'Work order priorities'],
    keyPoints: ['Follow lockout-tagout procedures', 'Wear proper PPE', 'Complete work orders by priority'],
    actionItems: [
      { id: 'ACT004', description: 'Repair AC unit in server room', assignedTo: 'Tech Team', dueDate: '2024-12-11', status: 'in_progress', priority: 'high' }
    ],
    attachments: [
      { id: 'ATT009', name: 'maintenance_schedule.pdf', type: 'document', url: '#', size: '1.5 MB', uploadedAt: '2024-12-10' },
      { id: 'ATT010', name: 'equipment_photo.jpg', type: 'image', url: '#', size: '3.2 MB', uploadedAt: '2024-12-10' }
    ],
    notes: 'Urgent maintenance required for server room AC. Team assigned for immediate action.',
    shift: 'night'
  }
];

const departments = ['All Departments', 'Housekeeping', 'Security', 'Maintenance', 'Operations', 'Front Desk', 'Administration', 'IT Support'];
const trainingTypes = [
  { value: 'safety', label: 'Safety Training', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
  { value: 'technical', label: 'Technical Training', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  { value: 'soft_skills', label: 'Soft Skills', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  { value: 'compliance', label: 'Compliance', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' }
];
const shifts = ['morning', 'evening', 'night'];
const priorities = ['low', 'medium', 'high'];
const sites = ['Main Building', 'Parking Area', 'IT Building', 'Warehouse', 'Admin Block', 'All Sites'];
const supervisors = ['John Safety Officer', 'Robert Engineer', 'Sarah Customer Manager', 'Manager Smith', 'Supervisor Lee', 'Manager Garcia', 'Team Lead Brown'];

const TrainingBriefingSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'training' | 'briefing'>('training');
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>(initialTrainingSessions);
  const [staffBriefings, setStaffBriefings] = useState<StaffBriefing[]>(initialStaffBriefings);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddTraining, setShowAddTraining] = useState(false);
  const [showAddBriefing, setShowAddBriefing] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<TrainingSession | null>(null);
  const [selectedBriefing, setSelectedBriefing] = useState<StaffBriefing | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Form states for training
  const [trainingForm, setTrainingForm] = useState({
    title: '',
    description: '',
    type: 'safety' as const,
    date: '',
    time: '',
    duration: '',
    trainer: '',
    supervisor: '',
    site: 'Main Building',
    department: 'All Departments',
    maxAttendees: 20,
    location: '',
    objectives: [''] as string[]
  });

  // Form states for briefing
  const [briefingForm, setBriefingForm] = useState({
    date: '',
    time: '',
    conductedBy: '',
    site: '',
    department: '',
    attendeesCount: 0,
    topics: [''] as string[],
    keyPoints: [''] as string[],
    actionItems: [] as Omit<ActionItem, 'id'>[],
    notes: '',
    shift: 'morning' as const
  });

  // Filter training sessions
  const filteredTrainingSessions = trainingSessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.trainer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.supervisor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.site.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || session.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Filter staff briefings
  const filteredStaffBriefings = staffBriefings.filter(briefing => {
    const matchesSearch = briefing.conductedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         briefing.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         briefing.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDepartment = filterDepartment === 'all' || briefing.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    toast.success(`${files.length} file(s) added`);
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    toast.info('File removed');
  };

  // Add training session
  const handleAddTraining = () => {
    if (!trainingForm.title || !trainingForm.date || !trainingForm.trainer) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newTraining: TrainingSession = {
      id: `TRN${String(trainingSessions.length + 1).padStart(3, '0')}`,
      title: trainingForm.title,
      description: trainingForm.description,
      type: trainingForm.type,
      date: trainingForm.date,
      time: trainingForm.time,
      duration: trainingForm.duration,
      trainer: trainingForm.trainer,
      supervisor: trainingForm.supervisor,
      site: trainingForm.site,
      department: trainingForm.department,
      attendees: [],
      maxAttendees: trainingForm.maxAttendees,
      status: 'scheduled',
      attachments: attachments.map((file, index) => ({
        id: `ATT${String(trainingSessions.length * 10 + index + 1).padStart(3, '0')}`,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 
               file.type.startsWith('video/') ? 'video' : 'document',
        url: '#',
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: new Date().toISOString().split('T')[0]
      })),
      feedback: [],
      location: trainingForm.location,
      objectives: trainingForm.objectives.filter(obj => obj.trim() !== '')
    };

    setTrainingSessions(prev => [newTraining, ...prev]);
    setTrainingForm({
      title: '',
      description: '',
      type: 'safety',
      date: '',
      time: '',
      duration: '',
      trainer: '',
      supervisor: '',
      site: 'Main Building',
      department: 'All Departments',
      maxAttendees: 20,
      location: '',
      objectives: ['']
    });
    setAttachments([]);
    setShowAddTraining(false);
    toast.success('Training session added successfully');
  };

  // Add staff briefing
  const handleAddBriefing = () => {
    if (!briefingForm.date || !briefingForm.conductedBy || !briefingForm.site) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newBriefing: StaffBriefing = {
      id: `BRI${String(staffBriefings.length + 1).padStart(3, '0')}`,
      date: briefingForm.date,
      time: briefingForm.time,
      conductedBy: briefingForm.conductedBy,
      site: briefingForm.site,
      department: briefingForm.department,
      attendeesCount: briefingForm.attendeesCount,
      topics: briefingForm.topics.filter(topic => topic.trim() !== ''),
      keyPoints: briefingForm.keyPoints.filter(point => point.trim() !== ''),
      actionItems: briefingForm.actionItems.map((item, index) => ({
        id: `ACT${String(staffBriefings.length * 10 + index + 1).padStart(3, '0')}`,
        ...item
      })),
      attachments: attachments.map((file, index) => ({
        id: `ATT${String(staffBriefings.length * 10 + index + 1).padStart(3, '0')}`,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 
               file.type.startsWith('video/') ? 'video' : 'document',
        url: '#',
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: new Date().toISOString().split('T')[0]
      })),
      notes: briefingForm.notes,
      shift: briefingForm.shift
    };

    setStaffBriefings(prev => [newBriefing, ...prev]);
    setBriefingForm({
      date: '',
      time: '',
      conductedBy: '',
      site: '',
      department: '',
      attendeesCount: 0,
      topics: [''],
      keyPoints: [''],
      actionItems: [],
      notes: '',
      shift: 'morning'
    });
    setAttachments([]);
    setShowAddBriefing(false);
    toast.success('Staff briefing added successfully');
  };

  // Delete training session
  const deleteTraining = (id: string) => {
    setTrainingSessions(prev => prev.filter(session => session.id !== id));
    toast.success('Training session deleted');
  };

  // Delete briefing
  const deleteBriefing = (id: string) => {
    setStaffBriefings(prev => prev.filter(briefing => briefing.id !== id));
    toast.success('Staff briefing deleted');
  };

  // Update training status
  const updateTrainingStatus = (id: string, status: TrainingSession['status']) => {
    setTrainingSessions(prev => prev.map(session => 
      session.id === id ? { ...session, status } : session
    ));
    toast.success(`Training status updated to ${status}`);
  };

  // Update action item status
  const updateActionItemStatus = (briefingId: string, actionItemId: string, status: ActionItem['status']) => {
    setStaffBriefings(prev => prev.map(briefing => {
      if (briefing.id === briefingId) {
        return {
          ...briefing,
          actionItems: briefing.actionItems.map(item => 
            item.id === actionItemId ? { ...item, status } : item
          )
        };
      }
      return briefing;
    }));
    toast.success('Action item status updated');
  };

  // Add objective field
  const addObjective = () => {
    setTrainingForm(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }));
  };

  // Remove objective field
  const removeObjective = (index: number) => {
    setTrainingForm(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  };

  // Update objective
  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...trainingForm.objectives];
    newObjectives[index] = value;
    setTrainingForm(prev => ({ ...prev, objectives: newObjectives }));
  };

  // Add topic field
  const addTopic = () => {
    setBriefingForm(prev => ({
      ...prev,
      topics: [...prev.topics, '']
    }));
  };

  // Remove topic field
  const removeTopic = (index: number) => {
    setBriefingForm(prev => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index)
    }));
  };

  // Update topic
  const updateTopic = (index: number, value: string) => {
    const newTopics = [...briefingForm.topics];
    newTopics[index] = value;
    setBriefingForm(prev => ({ ...prev, topics: newTopics }));
  };

  // Add key point field
  const addKeyPoint = () => {
    setBriefingForm(prev => ({
      ...prev,
      keyPoints: [...prev.keyPoints, '']
    }));
  };

  // Remove key point field
  const removeKeyPoint = (index: number) => {
    setBriefingForm(prev => ({
      ...prev,
      keyPoints: prev.keyPoints.filter((_, i) => i !== index)
    }));
  };

  // Update key point
  const updateKeyPoint = (index: number, value: string) => {
    const newKeyPoints = [...briefingForm.keyPoints];
    newKeyPoints[index] = value;
    setBriefingForm(prev => ({ ...prev, keyPoints: newKeyPoints }));
  };

  // Add action item
  const addActionItem = () => {
    setBriefingForm(prev => ({
      ...prev,
      actionItems: [
        ...prev.actionItems,
        {
          description: '',
          assignedTo: '',
          dueDate: '',
          status: 'pending',
          priority: 'medium'
        }
      ]
    }));
  };

  // Remove action item
  const removeActionItem = (index: number) => {
    setBriefingForm(prev => ({
      ...prev,
      actionItems: prev.actionItems.filter((_, i) => i !== index)
    }));
  };

  // Update action item
  const updateActionItem = (index: number, field: keyof ActionItem, value: string) => {
    const newActionItems = [...briefingForm.actionItems];
    newActionItems[index] = { ...newActionItems[index], [field]: value };
    setBriefingForm(prev => ({ ...prev, actionItems: newActionItems }));
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'ongoing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Get priority badge color
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Get shift badge color
  const getShiftBadge = (shift: string) => {
    switch (shift) {
      case 'morning': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'evening': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'night': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calendar navigation
  const nextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const prevMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  // Get events for calendar
  const getCalendarEvents = () => {
    const events = [];
    
    // Training events
    trainingSessions.forEach(session => {
      events.push({
        id: session.id,
        title: session.title,
        date: session.date,
        type: 'training',
        color: 'bg-blue-500',
        session
      });
    });
    
    // Briefing events
    staffBriefings.forEach(briefing => {
      events.push({
        id: briefing.id,
        title: `Briefing - ${briefing.department}`,
        date: briefing.date,
        type: 'briefing',
        color: 'bg-green-500',
        briefing
      });
    });
    
    return events;
  };

  const calendarEvents = getCalendarEvents();

  // Mobile card component for training sessions
  const MobileTrainingCard = ({ session }: { session: TrainingSession }) => (
    <div className="border rounded-lg p-4 space-y-3 bg-white dark:bg-gray-800">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{session.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{session.description}</p>
        </div>
        <div className="flex flex-col gap-2 ml-2 flex-shrink-0">
          <Badge className={trainingTypes.find(t => t.value === session.type)?.color}>
            {trainingTypes.find(t => t.value === session.type)?.label}
          </Badge>
          <Badge className={getStatusBadge(session.status)}>
            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-600 dark:text-gray-400 truncate">{formatDate(session.date)}</span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-600 dark:text-gray-400 truncate">{session.time}</span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-600 dark:text-gray-400 truncate">{session.trainer}</span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-600 dark:text-gray-400 truncate">{session.attendees.length}/{session.maxAttendees}</span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 pt-2 border-t dark:border-gray-700">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1 min-w-[80px]">
              <Eye className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">View</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:w-full max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Training Session Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold">{session.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{session.description}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Date & Time</p>
                  <p className="text-sm">{formatDate(session.date)} at {session.time}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Duration</p>
                  <p className="text-sm">{session.duration}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Trainer</p>
                  <p className="text-sm">{session.trainer}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Supervisor</p>
                  <p className="text-sm">{session.supervisor}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Site</p>
                  <p className="text-sm">{session.site}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Department</p>
                  <p className="text-sm">{session.department}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Location</p>
                  <p className="text-sm">{session.location}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Status</p>
                  <Badge className={getStatusBadge(session.status)}>
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  </Badge>
                </div>
              </div>
              
              {session.objectives.length > 0 && (
                <div>
                  <h4 className="text-sm sm:text-base font-medium mb-2">Objectives</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {session.objectives.map((obj, idx) => (
                      <li key={idx} className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{obj}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {session.feedback.length > 0 && (
                <div>
                  <h4 className="text-sm sm:text-base font-medium mb-2">Feedback</h4>
                  <div className="space-y-2">
                    {session.feedback.map(fb => (
                      <div key={fb.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                          <p className="font-medium text-sm">{fb.employeeName}</p>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-3 w-3 sm:h-4 sm:w-4 ${i < fb.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{fb.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
        
        <Select
          value={session.status}
          onValueChange={(value: any) => updateTrainingStatus(session.id, value)}
        >
          <SelectTrigger className="flex-1 min-w-[100px] h-8 text-xs sm:text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => deleteTraining(session.id)}
          className="flex-shrink-0 px-2"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  );

  // Mobile card component for staff briefings
  const MobileBriefingCard = ({ briefing }: { briefing: StaffBriefing }) => (
    <div className="border rounded-lg p-4 space-y-3 bg-white dark:bg-gray-800">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
            Briefing - {briefing.site}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={getShiftBadge(briefing.shift)}>
              {briefing.shift.charAt(0).toUpperCase() + briefing.shift.slice(1)} Shift
            </Badge>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">by {briefing.conductedBy}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-600 dark:text-gray-400 truncate">{formatDate(briefing.date)}</span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-600 dark:text-gray-400 truncate">{briefing.time}</span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <Building className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-600 dark:text-gray-400 truncate">{briefing.department}</span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-600 dark:text-gray-400 truncate">{briefing.attendeesCount} attendees</span>
        </div>
      </div>
      
      {briefing.topics.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {briefing.topics.slice(0, 3).map((topic, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {topic}
            </Badge>
          ))}
          {briefing.topics.length > 3 && (
            <Badge variant="outline" className="text-xs">+{briefing.topics.length - 3}</Badge>
          )}
        </div>
      )}
      
      <div className="flex gap-2 pt-2 border-t dark:border-gray-700">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1 min-w-[80px]">
              <Eye className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">View</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:w-full max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Staff Briefing Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold">
                  {briefing.site} - {briefing.department}
                </h3>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <Badge className={getShiftBadge(briefing.shift)}>
                    {briefing.shift.charAt(0).toUpperCase() + briefing.shift.slice(1)} Shift
                  </Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Conducted by {briefing.conductedBy}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Date & Time</p>
                  <p className="text-sm">{formatDate(briefing.date)} at {briefing.time}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Attendees</p>
                  <p className="text-sm">{briefing.attendeesCount} staff members</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Site</p>
                  <p className="text-sm">{briefing.site}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Department</p>
                  <p className="text-sm">{briefing.department}</p>
                </div>
              </div>
              
              {briefing.topics.length > 0 && (
                <div>
                  <h4 className="text-sm sm:text-base font-medium mb-2">Topics Discussed</h4>
                  <div className="flex flex-wrap gap-2">
                    {briefing.topics.map((topic, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">{topic}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {briefing.keyPoints.length > 0 && (
                <div>
                  <h4 className="text-sm sm:text-base font-medium mb-2">Key Points</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {briefing.keyPoints.map((point, idx) => (
                      <li key={idx} className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{point}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {briefing.actionItems.length > 0 && (
                <div>
                  <h4 className="text-sm sm:text-base font-medium mb-2">Action Items</h4>
                  <div className="space-y-2">
                    {briefing.actionItems.map(item => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded gap-2">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateActionItemStatus(
                              briefing.id,
                              item.id,
                              item.status === 'completed' ? 'pending' : 'completed'
                            )}
                            className="flex-shrink-0 p-1 h-auto"
                          >
                            {item.status === 'completed' ? (
                              <CheckSquare className="h-4 w-4 text-green-500" />
                            ) : (
                              <Square className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{item.description}</p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                              <span className="truncate">Assigned: {item.assignedTo}</span>
                              <span className="whitespace-nowrap">Due: {formatDate(item.dueDate)}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={getPriorityBadge(item.priority) + " sm:ml-2 self-start sm:self-center"}>
                          {item.priority.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {briefing.notes && (
                <div>
                  <h4 className="text-sm sm:text-base font-medium mb-2">Notes</h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    {briefing.notes}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => deleteBriefing(briefing.id)}
          className="flex-shrink-0 px-2"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Training & Staff Briefing</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
              Manage training sessions and daily staff briefings
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
              className="flex-1 sm:flex-none min-w-[100px]"
            >
              {viewMode === 'list' ? (
                <>
                  <CalendarDays className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Calendar View</span>
                  <span className="sm:hidden">Calendar</span>
                </>
              ) : (
                <>
                  <List className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">List View</span>
                  <span className="sm:hidden">List</span>
                </>
              )}
            </Button>
            <Dialog open={showAddTraining} onOpenChange={setShowAddTraining}>
              <DialogTrigger asChild>
                <Button className="flex-1 sm:flex-none min-w-[100px]">
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Add Training</span>
                  <span className="sm:hidden">Training</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] sm:w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">Add New Training Session</DialogTitle>
                  <DialogDescription className="text-sm">
                    Schedule a new training session for your team.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 py-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Training Title *</label>
                      <Input
                        placeholder="Enter training title"
                        value={trainingForm.title}
                        onChange={(e) => setTrainingForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Training Type</label>
                      <Select
                        value={trainingForm.type}
                        onValueChange={(value: any) => setTrainingForm(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {trainingTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Date *</label>
                      <Input
                        type="date"
                        value={trainingForm.date}
                        onChange={(e) => setTrainingForm(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Time</label>
                      <Input
                        type="time"
                        value={trainingForm.time}
                        onChange={(e) => setTrainingForm(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Duration</label>
                      <Input
                        placeholder="e.g., 2 hours"
                        value={trainingForm.duration}
                        onChange={(e) => setTrainingForm(prev => ({ ...prev, duration: e.target.value }))}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Trainer *</label>
                      <Input
                        placeholder="Enter trainer name"
                        value={trainingForm.trainer}
                        onChange={(e) => setTrainingForm(prev => ({ ...prev, trainer: e.target.value }))}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Supervisor</label>
                      <Select
                        value={trainingForm.supervisor}
                        onValueChange={(value) => setTrainingForm(prev => ({ ...prev, supervisor: value }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select supervisor" />
                        </SelectTrigger>
                        <SelectContent>
                          {supervisors.map(supervisor => (
                            <SelectItem key={supervisor} value={supervisor}>
                              {supervisor}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Site</label>
                      <Select
                        value={trainingForm.site}
                        onValueChange={(value) => setTrainingForm(prev => ({ ...prev, site: value }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select site" />
                        </SelectTrigger>
                        <SelectContent>
                          {sites.map(site => (
                            <SelectItem key={site} value={site}>
                              {site}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Department</label>
                      <Select
                        value={trainingForm.department}
                        onValueChange={(value) => setTrainingForm(prev => ({ ...prev, department: value }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map(dept => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Max Attendees</label>
                      <Input
                        type="number"
                        min="1"
                        value={trainingForm.maxAttendees}
                        onChange={(e) => setTrainingForm(prev => ({ ...prev, maxAttendees: parseInt(e.target.value) || 1 }))}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Location</label>
                      <Input
                        placeholder="Enter location"
                        value={trainingForm.location}
                        onChange={(e) => setTrainingForm(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Training Objectives</label>
                      <div className="space-y-2">
                        {trainingForm.objectives.map((objective, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder={`Objective ${index + 1}`}
                              value={objective}
                              onChange={(e) => updateObjective(index, e.target.value)}
                              className="flex-1"
                            />
                            {trainingForm.objectives.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeObjective(index)}
                                className="flex-shrink-0"
                              >
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addObjective}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Objective
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Description</label>
                      <Textarea
                        placeholder="Enter training description"
                        value={trainingForm.description}
                        onChange={(e) => setTrainingForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Attachments Section */}
                <div className="py-4 border-t dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold">Attachments</h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Upload training materials, photos, or videos
                      </p>
                    </div>
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full sm:w-auto"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Files
                      </Button>
                    </div>
                  </div>
                  
                  {attachments.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {file.type.startsWith('image/') ? (
                              <ImageIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                            ) : file.type.startsWith('video/') ? (
                              <Video className="h-5 w-5 text-red-500 flex-shrink-0" />
                            ) : (
                              <File className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(file.size / (1024 * 1024)).toFixed(1)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                            className="flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <DialogClose asChild>
                    <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleAddTraining} className="w-full sm:w-auto">Add Training Session</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={showAddBriefing} onOpenChange={setShowAddBriefing}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="flex-1 sm:flex-none min-w-[100px]">
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Add Briefing</span>
                  <span className="sm:hidden">Briefing</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] sm:w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">Add New Staff Briefing</DialogTitle>
                  <DialogDescription className="text-sm">
                    Record daily staff briefing details and action items.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 py-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Date *</label>
                      <Input
                        type="date"
                        value={briefingForm.date}
                        onChange={(e) => setBriefingForm(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Time</label>
                      <Input
                        type="time"
                        value={briefingForm.time}
                        onChange={(e) => setBriefingForm(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Shift</label>
                      <Select
                        value={briefingForm.shift}
                        onValueChange={(value: any) => setBriefingForm(prev => ({ ...prev, shift: value }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select shift" />
                        </SelectTrigger>
                        <SelectContent>
                          {shifts.map(shift => (
                            <SelectItem key={shift} value={shift}>
                              {shift.charAt(0).toUpperCase() + shift.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Conducted By *</label>
                      <Input
                        placeholder="Enter conductor name"
                        value={briefingForm.conductedBy}
                        onChange={(e) => setBriefingForm(prev => ({ ...prev, conductedBy: e.target.value }))}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Site *</label>
                      <Input
                        placeholder="Enter site/location"
                        value={briefingForm.site}
                        onChange={(e) => setBriefingForm(prev => ({ ...prev, site: e.target.value }))}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Department</label>
                      <Select
                        value={briefingForm.department}
                        onValueChange={(value) => setBriefingForm(prev => ({ ...prev, department: value }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map(dept => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Number of Attendees</label>
                      <Input
                        type="number"
                        min="0"
                        value={briefingForm.attendeesCount}
                        onChange={(e) => setBriefingForm(prev => ({ ...prev, attendeesCount: parseInt(e.target.value) || 0 }))}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Topics Discussed</label>
                      <div className="space-y-2">
                        {briefingForm.topics.map((topic, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder={`Topic ${index + 1}`}
                              value={topic}
                              onChange={(e) => updateTopic(index, e.target.value)}
                              className="flex-1"
                            />
                            {briefingForm.topics.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTopic(index)}
                                className="flex-shrink-0"
                              >
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addTopic}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Topic
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Key Points</label>
                      <div className="space-y-2">
                        {briefingForm.keyPoints.map((point, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder={`Key point ${index + 1}`}
                              value={point}
                              onChange={(e) => updateKeyPoint(index, e.target.value)}
                              className="flex-1"
                            />
                            {briefingForm.keyPoints.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeKeyPoint(index)}
                                className="flex-shrink-0"
                              >
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addKeyPoint}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Key Point
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Notes</label>
                      <Textarea
                        placeholder="Enter additional notes"
                        value={briefingForm.notes}
                        onChange={(e) => setBriefingForm(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Action Items Section */}
                <div className="py-4 border-t dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold">Action Items</h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Add tasks assigned during the briefing
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addActionItem}
                      className="w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Action Item
                    </Button>
                  </div>
                  
                  {briefingForm.actionItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-3">
                      <div className="sm:col-span-2">
                        <label className="text-xs font-medium mb-1 block">Description</label>
                        <Input
                          placeholder="Task description"
                          value={item.description}
                          onChange={(e) => updateActionItem(index, 'description', e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block">Assigned To</label>
                        <Input
                          placeholder="Person/Team"
                          value={item.assignedTo}
                          onChange={(e) => updateActionItem(index, 'assignedTo', e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block">Due Date</label>
                        <Input
                          type="date"
                          value={item.dueDate}
                          onChange={(e) => updateActionItem(index, 'dueDate', e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="flex items-end gap-2 sm:col-span-4">
                        <div className="flex-1">
                          <label className="text-xs font-medium mb-1 block">Priority</label>
                          <Select
                            value={item.priority}
                            onValueChange={(value: any) => updateActionItem(index, 'priority', value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {priorities.map(priority => (
                                <SelectItem key={priority} value={priority}>
                                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeActionItem(index)}
                          className="mb-0.5"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Attachments Section */}
                <div className="py-4 border-t dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold">Attachments</h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Upload photos, documents, or other files
                      </p>
                    </div>
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*,video/*,.pdf,.doc,.docx"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full sm:w-auto"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Files
                      </Button>
                    </div>
                  </div>
                  
                  {attachments.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {file.type.startsWith('image/') ? (
                              <ImageIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                            ) : file.type.startsWith('video/') ? (
                              <Video className="h-5 w-5 text-red-500 flex-shrink-0" />
                            ) : (
                              <File className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(file.size / (1024 * 1024)).toFixed(1)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                            className="flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <DialogClose asChild>
                    <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleAddBriefing} className="w-full sm:w-auto">Add Staff Briefing</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Total Training</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{trainingSessions.length}</p>
                  <p className="text-xs text-green-600 mt-1 hidden sm:block">+2 this week</p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-full flex-shrink-0">
                  <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-300" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Briefings</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{staffBriefings.length}</p>
                  <p className="text-xs text-green-600 mt-1 hidden sm:block">Daily avg: 3</p>
                </div>
                <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900 rounded-full flex-shrink-0">
                  <Users className="h-4 w-4 sm:h-6 sm:w-6 text-green-600 dark:text-green-300" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Completed</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {trainingSessions.filter(t => t.status === 'completed').length}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 hidden sm:block">
                    {Math.round((trainingSessions.filter(t => t.status === 'completed').length / trainingSessions.length) * 100)}% rate
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900 rounded-full flex-shrink-0">
                  <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-300" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Pending Actions</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {staffBriefings.reduce((acc, briefing) => 
                      acc + briefing.actionItems.filter(a => a.status === 'pending').length, 0
                    )}
                  </p>
                  <p className="text-xs text-red-600 mt-1 hidden sm:block">Needs attention</p>
                </div>
                <div className="p-2 sm:p-3 bg-red-100 dark:bg-red-900 rounded-full flex-shrink-0">
                  <AlertCircle className="h-4 w-4 sm:h-6 sm:w-6 text-red-600 dark:text-red-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Main Content */}
      {viewMode === 'list' ? (
        <>
          {/* Tabs */}
          <Tabs defaultValue="training" className="mb-4 sm:mb-6" onValueChange={(value: any) => setActiveTab(value)}>
            <TabsList className="grid w-full sm:w-auto grid-cols-2">
              <TabsTrigger value="training" className="flex items-center gap-2 text-xs sm:text-sm">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Training</span>
                <span className="xs:hidden">TRN</span>
              </TabsTrigger>
              <TabsTrigger value="briefing" className="flex items-center gap-2 text-xs sm:text-sm">
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Briefings</span>
                <span className="xs:hidden">BRF</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4 sm:mb-6"
          >
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <Input
                      placeholder={activeTab === 'training' ? "Search training..." : "Search briefings..."}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:w-64 text-sm"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                        <SelectTrigger className="w-32 sm:w-40 text-sm">
                          <SelectValue placeholder="All Depts" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          {departments.map(dept => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {activeTab === 'training' && (
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-28 sm:w-32 text-sm">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="ongoing">Ongoing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    
                    <Button variant="outline" size="sm" className="text-sm">
                      <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden xs:inline">Export</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Training Sessions Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'training' ? (
              <motion.div
                key="training"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">Training Sessions</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Manage weekly training sessions and track attendance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6">
                    {filteredTrainingSessions.length === 0 ? (
                      <div className="text-center py-8 sm:py-12">
                        <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">
                          No training sessions found
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                          Try adjusting your filters or add a new training session.
                        </p>
                        <Button onClick={() => setShowAddTraining(true)} size="sm" className="text-xs sm:text-sm">
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Add Training
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        {/* Desktop View */}
                        <div className="hidden md:block">
                          {filteredTrainingSessions.map(session => (
                            <Card key={session.id} className="overflow-hidden mb-4">
                              <div className="p-4 sm:p-6">
                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="min-w-0 flex-1">
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                                          {session.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                          {session.description}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                                        <Badge className={trainingTypes.find(t => t.value === session.type)?.color}>
                                          {trainingTypes.find(t => t.value === session.type)?.label}
                                        </Badge>
                                        <Badge className={getStatusBadge(session.status)}>
                                          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                                        </Badge>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                          {formatDate(session.date)}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                          {session.time} ({session.duration})
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                          {session.trainer}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                          {session.attendees.length}/{session.maxAttendees} attendees
                                        </span>
                                      </div>
                                    </div>
                                    
                                    {session.objectives.length > 0 && (
                                      <div className="mt-4">
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                          Objectives:
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                          {session.objectives.map((obj, idx) => (
                                            <Badge key={idx} variant="outline" className="text-xs">
                                              {obj}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex flex-row lg:flex-col gap-2 lg:min-w-[200px]">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="flex-1 lg:w-full">
                                          <Eye className="h-4 w-4 mr-2" />
                                          View Details
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="w-[95vw] sm:w-full max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                                        <DialogHeader>
                                          <DialogTitle className="text-lg sm:text-xl">Training Session Details</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <div>
                                            <h3 className="text-base sm:text-lg font-semibold">{session.title}</h3>
                                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{session.description}</p>
                                          </div>
                                          
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                              <p className="text-xs sm:text-sm font-medium text-gray-500">Date & Time</p>
                                              <p className="text-sm">{formatDate(session.date)} at {session.time}</p>
                                            </div>
                                            <div>
                                              <p className="text-xs sm:text-sm font-medium text-gray-500">Duration</p>
                                              <p className="text-sm">{session.duration}</p>
                                            </div>
                                            <div>
                                              <p className="text-xs sm:text-sm font-medium text-gray-500">Trainer</p>
                                              <p className="text-sm">{session.trainer}</p>
                                            </div>
                                            <div>
                                              <p className="text-xs sm:text-sm font-medium text-gray-500">Supervisor</p>
                                              <p className="text-sm">{session.supervisor}</p>
                                            </div>
                                            <div>
                                              <p className="text-xs sm:text-sm font-medium text-gray-500">Site</p>
                                              <p className="text-sm">{session.site}</p>
                                            </div>
                                            <div>
                                              <p className="text-xs sm:text-sm font-medium text-gray-500">Department</p>
                                              <p className="text-sm">{session.department}</p>
                                            </div>
                                            <div>
                                              <p className="text-xs sm:text-sm font-medium text-gray-500">Location</p>
                                              <p className="text-sm">{session.location}</p>
                                            </div>
                                            <div>
                                              <p className="text-xs sm:text-sm font-medium text-gray-500">Status</p>
                                              <Badge className={getStatusBadge(session.status)}>
                                                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                                              </Badge>
                                            </div>
                                          </div>
                                          
                                          {session.objectives.length > 0 && (
                                            <div>
                                              <h4 className="text-sm sm:text-base font-medium mb-2">Objectives</h4>
                                              <ul className="list-disc pl-5 space-y-1">
                                                {session.objectives.map((obj, idx) => (
                                                  <li key={idx} className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{obj}</li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                          
                                          {session.feedback.length > 0 && (
                                            <div>
                                              <h4 className="text-sm sm:text-base font-medium mb-2">Feedback</h4>
                                              <div className="space-y-2">
                                                {session.feedback.map(fb => (
                                                  <div key={fb.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                                      <p className="font-medium text-sm">{fb.employeeName}</p>
                                                      <div className="flex">
                                                        {[...Array(5)].map((_, i) => (
                                                          <Star key={i} className={`h-3 w-3 sm:h-4 sm:w-4 ${i < fb.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                                        ))}
                                                      </div>
                                                    </div>
                                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{fb.comment}</p>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                    
                                    <div className="flex gap-2">
                                      <Select
                                        value={session.status}
                                        onValueChange={(value: any) => updateTrainingStatus(session.id, value)}
                                      >
                                        <SelectTrigger className="flex-1 h-8 text-xs sm:text-sm">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="scheduled">Scheduled</SelectItem>
                                          <SelectItem value="ongoing">Ongoing</SelectItem>
                                          <SelectItem value="completed">Completed</SelectItem>
                                          <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteTraining(session.id)}
                                        className="flex-shrink-0 px-2"
                                      >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden space-y-3">
                          {filteredTrainingSessions.map(session => (
                            <MobileTrainingCard key={session.id} session={session} />
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="briefing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">Staff Briefings</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Daily staff briefings and action items
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6">
                    {filteredStaffBriefings.length === 0 ? (
                      <div className="text-center py-8 sm:py-12">
                        <MessageSquare className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">
                          No staff briefings found
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                          Try adjusting your filters or add a new staff briefing.
                        </p>
                        <Button onClick={() => setShowAddBriefing(true)} size="sm" className="text-xs sm:text-sm">
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Add Briefing
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        {/* Desktop View */}
                        <div className="hidden md:block">
                          {filteredStaffBriefings.map(briefing => (
                            <Card key={briefing.id} className="overflow-hidden mb-4">
                              <div className="p-4 sm:p-6">
                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                      <div>
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                                          Staff Briefing - {briefing.site}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-3 mt-1">
                                          <Badge className={getShiftBadge(briefing.shift)}>
                                            {briefing.shift.charAt(0).toUpperCase() + briefing.shift.slice(1)} Shift
                                          </Badge>
                                          <span className="text-sm text-gray-600 dark:text-gray-400">
                                            by {briefing.conductedBy}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="text-right ml-4 flex-shrink-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                          {formatDate(briefing.date)}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{briefing.time}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                      <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Department:</p>
                                        <p className="text-gray-600 dark:text-gray-400">{briefing.department}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Attendees:</p>
                                        <p className="text-gray-600 dark:text-gray-400">{briefing.attendeesCount} staff</p>
                                      </div>
                                    </div>
                                    
                                    {briefing.topics.length > 0 && (
                                      <div className="mt-4">
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                          Topics:
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                          {briefing.topics.map((topic, index) => (
                                            <Badge key={index} variant="outline" className="text-xs">
                                              {topic}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {briefing.keyPoints.length > 0 && (
                                      <div className="mt-4">
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                          Key Points:
                                        </h4>
                                        <ul className="list-disc pl-5 space-y-1">
                                          {briefing.keyPoints.map((point, index) => (
                                            <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                                              {point}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    
                                    {briefing.actionItems.length > 0 && (
                                      <div className="mt-4">
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                          Action Items:
                                        </h4>
                                        <div className="space-y-2">
                                          {briefing.actionItems.map(item => (
                                            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded gap-2">
                                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => updateActionItemStatus(
                                                    briefing.id,
                                                    item.id,
                                                    item.status === 'completed' ? 'pending' : 'completed'
                                                  )}
                                                  className="flex-shrink-0 p-1 h-auto"
                                                >
                                                  {item.status === 'completed' ? (
                                                    <CheckSquare className="h-4 w-4 text-green-500" />
                                                  ) : (
                                                    <Square className="h-4 w-4 text-gray-400" />
                                                  )}
                                                </Button>
                                                <div className="min-w-0 flex-1">
                                                  <p className="font-medium text-sm truncate">{item.description}</p>
                                                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                    <span className="truncate">Assigned: {item.assignedTo}</span>
                                                    <span className="whitespace-nowrap">Due: {formatDate(item.dueDate)}</span>
                                                  </div>
                                                </div>
                                              </div>
                                              <Badge className={getPriorityBadge(item.priority) + " sm:ml-2 self-start sm:self-center"}>
                                                {item.priority.toUpperCase()}
                                              </Badge>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {briefing.notes && (
                                      <div className="mt-4">
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes:</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                                          {briefing.notes}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex flex-row lg:flex-col gap-2 lg:min-w-[120px]">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="flex-1 lg:w-full">
                                          <Eye className="h-4 w-4 mr-2" />
                                          View
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="w-[95vw] sm:w-full max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                                        <DialogHeader>
                                          <DialogTitle className="text-lg sm:text-xl">Staff Briefing Details</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <div>
                                            <h3 className="text-base sm:text-lg font-semibold">
                                              {briefing.site} - {briefing.department}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-3 mt-1">
                                              <Badge className={getShiftBadge(briefing.shift)}>
                                                {briefing.shift.charAt(0).toUpperCase() + briefing.shift.slice(1)} Shift
                                              </Badge>
                                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                                Conducted by {briefing.conductedBy}
                                              </span>
                                            </div>
                                          </div>
                                          
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                              <p className="text-xs sm:text-sm font-medium text-gray-500">Date & Time</p>
                                              <p className="text-sm">{formatDate(briefing.date)} at {briefing.time}</p>
                                            </div>
                                            <div>
                                              <p className="text-xs sm:text-sm font-medium text-gray-500">Attendees</p>
                                              <p className="text-sm">{briefing.attendeesCount} staff members</p>
                                            </div>
                                            <div>
                                              <p className="text-xs sm:text-sm font-medium text-gray-500">Site</p>
                                              <p className="text-sm">{briefing.site}</p>
                                            </div>
                                            <div>
                                              <p className="text-xs sm:text-sm font-medium text-gray-500">Department</p>
                                              <p className="text-sm">{briefing.department}</p>
                                            </div>
                                          </div>
                                          
                                          {briefing.notes && (
                                            <div>
                                              <h4 className="text-sm sm:text-base font-medium mb-2">Notes</h4>
                                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                                                {briefing.notes}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                    
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => deleteBriefing(briefing.id)}
                                      className="flex-shrink-0 px-2"
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden space-y-3">
                          {filteredStaffBriefings.map(briefing => (
                            <MobileBriefingCard key={briefing.id} briefing={briefing} />
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        /* Calendar View */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base sm:text-lg">Training & Briefing Calendar</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    View all scheduled training sessions and staff briefings
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={prevMonth} className="h-8 w-8 p-0">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="text-sm sm:text-base font-semibold min-w-[140px] text-center">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <Button variant="outline" size="sm" onClick={nextMonth} className="h-8 w-8 p-0">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              {/* Calendar Grid - Simplified for now */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                  <div key={idx} className="text-center font-medium text-gray-500 dark:text-gray-400 py-2 text-xs sm:text-sm">
                    <span className="hidden sm:inline">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][idx]}</span>
                    <span className="sm:hidden">{day}</span>
                  </div>
                ))}
                
                {/* Placeholder calendar days */}
                {[...Array(35)].map((_, idx) => (
                  <div
                    key={idx}
                    className="aspect-square border rounded p-1 sm:p-2 text-xs sm:text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <div className="text-right text-gray-600 dark:text-gray-400">{idx + 1}</div>
                  </div>
                ))}
              </div>
              
              {/* Upcoming Events */}
              <div className="space-y-3 mt-6 sm:mt-8">
                <h4 className="text-sm sm:text-base font-semibold">Upcoming Events</h4>
                {calendarEvents
                  .filter(event => new Date(event.date) >= new Date())
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(0, 5)
                  .map(event => (
                    <div key={event.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 sm:h-3 sm:w-3 rounded-full ${event.color}`}></div>
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm font-medium truncate max-w-[200px]">{event.title}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {formatDate(event.date)} • {event.type === 'training' ? 'Training' : 'Briefing'}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs sm:text-sm ml-auto sm:ml-0">
                        View
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

// Helper components
const Star: React.FC<{ className: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const List: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

export default TrainingBriefingSection;