import { Request, Response } from 'express';
import Expense, { IExpense } from '../models/Expense';
import Site from '../models/Site';
import mongoose from 'mongoose';

// Get all expenses with optional filters
export const getExpenses = async (req: Request, res: Response) => {
  try {
    const { siteId, startDate, endDate, category, expenseType } = req.query;
    
    // Build filter object
    const filter: any = {};
    
    if (siteId && siteId !== 'all' && mongoose.Types.ObjectId.isValid(siteId as string)) {
      filter.siteId = siteId;
    }
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (expenseType && expenseType !== 'all') {
      filter.expenseType = expenseType;
    }
    
    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate as string);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate as string);
      }
    }
    
    const expenses = await Expense.find(filter)
      .populate('siteId', 'name location clientName')
      .sort({ date: -1 })
      .lean();
    
    return res.status(200).json({
      success: true,
      data: expenses || []
    });
  } catch (error: any) {
    console.error('Error fetching expenses:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch expenses'
    });
  }
};

// Get expenses by site
export const getExpensesBySite = async (req: Request, res: Response) => {
  try {
    const { siteId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(siteId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid site ID'
      });
    }
    
    const expenses = await Expense.find({ siteId })
      .populate('siteId', 'name location clientName')
      .sort({ date: -1 })
      .lean();
    
    return res.status(200).json({
      success: true,
      data: expenses || []
    });
  } catch (error: any) {
    console.error('Error fetching site expenses:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch site expenses'
    });
  }
};

// Get monthly expenses summary for a site
export const getMonthlyExpenses = async (req: Request, res: Response) => {
  try {
    const { siteId } = req.params;
    const { year } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(siteId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid site ID'
      });
    }
    
    // Build date range for the year
    const targetYear = year ? parseInt(year as string) : new Date().getFullYear();
    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59);
    
    const monthlyExpenses = await Expense.aggregate([
      {
        $match: {
          siteId: new mongoose.Types.ObjectId(siteId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            year: { $year: '$date' }
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          categories: { $addToSet: '$category' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $project: {
          _id: 1,
          month: '$_id.month',
          year: '$_id.year',
          totalAmount: 1,
          count: 1,
          categories: 1
        }
      }
    ]);
    
    return res.status(200).json({
      success: true,
      data: monthlyExpenses || []
    });
  } catch (error: any) {
    console.error('Error fetching monthly expenses:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch monthly expenses'
    });
  }
};

// Get expense summary/stats
export const getExpenseStats = async (req: Request, res: Response) => {
  try {
    const { siteId } = req.query;
    
    const matchStage: any = {};
    if (siteId && siteId !== 'all' && mongoose.Types.ObjectId.isValid(siteId as string)) {
      matchStage.siteId = new mongoose.Types.ObjectId(siteId as string);
    }
    
    const stats = await Expense.aggregate([
      { $match: matchStage },
      {
        $facet: {
          totalStats: [
            {
              $group: {
                _id: null,
                totalExpenses: { $sum: '$amount' },
                averageExpense: { $avg: '$amount' },
                count: { $sum: 1 }
              }
            }
          ],
          byCategory: [
            {
              $group: {
                _id: '$category',
                total: { $sum: '$amount' },
                count: { $sum: 1 }
              }
            },
            { $sort: { total: -1 } }
          ],
          byExpenseType: [
            {
              $group: {
                _id: '$expenseType',
                total: { $sum: '$amount' },
                count: { $sum: 1 }
              }
            }
          ],
          byMonth: [
            {
              $group: {
                _id: {
                  year: { $year: '$date' },
                  month: { $month: '$date' }
                },
                total: { $sum: '$amount' }
              }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
          ]
        }
      }
    ]);
    
    const result = stats[0] || {
      totalStats: [],
      byCategory: [],
      byExpenseType: [],
      byMonth: []
    };
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error fetching expense stats:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch expense statistics'
    });
  }
};

// Create new expense
// Create new expense
export const createExpense = async (req: Request, res: Response) => {
  try {
    const { siteId, expenseType, category, description, amount, date, vendor, paymentMethod, customFields } = req.body;
    
    // Validate required fields
    if (!siteId) {
      return res.status(400).json({
        success: false,
        error: 'Site ID is required'
      });
    }
    
    if (!expenseType) {
      return res.status(400).json({
        success: false,
        error: 'Expense type is required'
      });
    }
    
    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Category is required'
      });
    }
    
    if (!description) {
      return res.status(400).json({
        success: false,
        error: 'Description is required'
      });
    }
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required'
      });
    }
    
    if (!vendor) {
      return res.status(400).json({
        success: false,
        error: 'Vendor is required'
      });
    }
    
    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Payment method is required'
      });
    }
    
    // Validate site exists
    if (!mongoose.Types.ObjectId.isValid(siteId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid site ID format'
      });
    }
    
    const site = await Site.findById(siteId);
    if (!site) {
      return res.status(404).json({
        success: false,
        error: 'Site not found'
      });
    }
    
    // Create expense
    const expenseData: any = {
      siteId: new mongoose.Types.ObjectId(siteId),
      expenseType,
      category,
      description,
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      vendor,
      paymentMethod
    };
    
    // Add custom fields if provided
    if (customFields && Array.isArray(customFields) && customFields.length > 0) {
      expenseData.customFields = customFields.filter(
        (field: any) => field && field.fieldName && field.fieldValue
      );
    }
    
    const expense = new Expense(expenseData);
    await expense.save();
    
    // IMPORTANT: Populate site details for response
    const populatedExpense = await Expense.findById(expense._id)
      .populate('siteId', 'name location clientName')
      .lean();
    
    return res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: populatedExpense
    });
  } catch (error: any) {
    console.error('Error creating expense:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create expense'
    });
  }
};

// Update expense
export const updateExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid expense ID'
      });
    }
    
    // Check if expense exists
    const existingExpense = await Expense.findById(id);
    if (!existingExpense) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found'
      });
    }
    
    // Prepare update data
    const updateData: any = { ...req.body };
    
    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.id;
    delete updateData.__v;
    
    // Convert amount to number if present
    if (updateData.amount) {
      updateData.amount = Number(updateData.amount);
    }
    
    // Convert date if present
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }
    
    // Handle custom fields
    if (updateData.customFields && Array.isArray(updateData.customFields)) {
      updateData.customFields = updateData.customFields.filter(
        (field: any) => field && field.fieldName && field.fieldValue
      );
    }
    
    // Update expense
    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('siteId', 'name location clientName');
    
    return res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: updatedExpense
    });
  } catch (error: any) {
    console.error('Error updating expense:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update expense'
    });
  }
};

// Delete expense
export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid expense ID'
      });
    }
    
    const deletedExpense = await Expense.findByIdAndDelete(id);
    
    if (!deletedExpense) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting expense:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete expense'
    });
  }
};

// Bulk delete expenses
export const bulkDeleteExpenses = async (req: Request, res: Response) => {
  try {
    const { siteId, startDate, endDate } = req.body;
    
    const filter: any = {};
    
    if (siteId && mongoose.Types.ObjectId.isValid(siteId)) {
      filter.siteId = siteId;
    }
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }
    
    // Don't allow empty filter (would delete all expenses)
    if (Object.keys(filter).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one filter criteria is required'
      });
    }
    
    const result = await Expense.deleteMany(filter);
    
    return res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} expenses`,
      deletedCount: result.deletedCount
    });
  } catch (error: any) {
    console.error('Error bulk deleting expenses:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete expenses'
    });
  }
};