import express from 'express';
import {
  getExpenses,
  getExpensesBySite,
  getMonthlyExpenses,
  getExpenseStats,
  createExpense,
  updateExpense,
  deleteExpense,
  bulkDeleteExpenses
} from '../controllers/expenseController';

const router = express.Router();

// GET routes
router.get('/', getExpenses);
router.get('/stats', getExpenseStats);
router.get('/site/:siteId', getExpensesBySite);
router.get('/site/:siteId/monthly', getMonthlyExpenses);

// POST routes
router.post('/', createExpense);
router.post('/bulk-delete', bulkDeleteExpenses);

// PUT routes
router.put('/:id', updateExpense);

// DELETE routes
router.delete('/:id', deleteExpense);

export default router;