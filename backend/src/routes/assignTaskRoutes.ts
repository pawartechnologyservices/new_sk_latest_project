import express from 'express';
import {
  getAllAssignTasks,
  getAssignTaskById,
  createAssignTask,
  updateAssignTask,
  updateAssignTaskStatus,
  deleteAssignTask,
  addHourlyUpdate,
  addAttachment,
  deleteAttachment,
  getAssignTaskStats,
  searchAssignTasks
} from '../controllers/assignTaskController';

const router = express.Router();

// Base routes
router.get('/', getAllAssignTasks);
router.get('/search', searchAssignTasks);
router.get('/stats', getAssignTaskStats);
router.get('/:id', getAssignTaskById);

// Create operation
router.post('/', createAssignTask);

// Update operations
router.put('/:id', updateAssignTask);
router.patch('/:id/status', updateAssignTaskStatus);

// Hourly updates
router.post('/:id/hourly-updates', addHourlyUpdate);

// Attachment management
router.post('/:id/attachments', addAttachment);
router.delete('/:id/attachments/:attachmentId', deleteAttachment);

// Delete operation
router.delete('/:id', deleteAssignTask);

export default router;