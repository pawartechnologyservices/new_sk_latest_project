import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  siteId: mongoose.Types.ObjectId;
  expenseType: string;
  category: string;
  description: string;
  amount: number;
  date: Date;
  vendor: string;
  paymentMethod: string;
  customFields?: Array<{
    fieldName: string;
    fieldValue: string;
  }>;
  receiptUrl?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>({
  siteId: {
    type: Schema.Types.ObjectId,
    ref: 'Site',
    required: [true, 'Site ID is required'],
    index: true
  },
  expenseType: {
    type: String,
    required: [true, 'Expense type is required'],
    enum: ['operational', 'maintenance', 'salary', 'utility', 'supplies', 'other']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'housekeeping', 'security', 'parking', 'waste_management',
      'maintenance', 'electricity', 'water', 'internet',
      'salary', 'supplies', 'equipment', 'transportation',
      'office_expense', 'other'
    ]
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
    index: true
  },
  vendor: {
    type: String,
    required: [true, 'Vendor name is required'],
    trim: true
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['cash', 'bank transfer', 'credit card', 'cheque', 'upi']
  },
  customFields: [{
    fieldName: {
      type: String,
      required: true,
      trim: true
    },
    fieldValue: {
      type: String,
      required: true,
      trim: true
    }
  }],
  receiptUrl: {
    type: String,
    trim: true
  },
  createdBy: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound indexes for better query performance
ExpenseSchema.index({ siteId: 1, date: -1 });
ExpenseSchema.index({ siteId: 1, category: 1 });

export default mongoose.model<IExpense>('Expense', ExpenseSchema);