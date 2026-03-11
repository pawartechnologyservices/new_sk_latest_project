import { Request, Response } from 'express';
import EPFForm from '../models/EPFForm';
import Employee from '../models/Employee';

// Create EPF Form
export const createEPFForm = async (req: Request, res: Response) => {
  try {
    const formData = req.body;
    
    console.log('Creating EPF Form with data:', formData);
    
    if (!formData.employeeId || !formData.memberName || !formData.aadharNumber) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID, Member Name, and Aadhar Number are required'
      });
    }
    
    // Try to find employee by MongoDB _id first
    let employee = null;
    
    // Check if employeeId is a valid MongoDB ObjectId
    if (formData.employeeId.match(/^[0-9a-fA-F]{24}$/)) {
      employee = await Employee.findById(formData.employeeId);
    }
    
    // If not found by _id, try by employeeId field
    if (!employee) {
      employee = await Employee.findOne({ employeeId: formData.employeeId });
    }
    
    // If still not found, try by employeeNumber
    if (!employee && formData.employeeNumber) {
      employee = await Employee.findOne({ employeeId: formData.employeeNumber });
    }
    
    if (!employee) {
      console.error('Employee not found with ID:', formData.employeeId);
      return res.status(404).json({
        success: false,
        message: 'Employee not found. Please check the employee ID.'
      });
    }
    
    console.log('Found employee:', employee._id, employee.employeeId);
    
    // Check if form already exists
    const existingForm = await EPFForm.findOne({ 
      $or: [
        { employeeId: employee.employeeId },
        { employee: employee._id }
      ]
    });
    
    if (existingForm) {
      return res.status(400).json({
        success: false,
        message: 'EPF Form already exists for this employee'
      });
    }
    
    // Create EPF Form with proper employee reference
    const epfForm = new EPFForm({
      ...formData,
      employee: employee._id,
      employeeId: employee.employeeId
    });
    
    await epfForm.save();
    
    // Populate employee details before returning
    await epfForm.populate('employee', 'name employeeId email phone department position');
    
    res.status(201).json({
      success: true,
      message: 'EPF Form created successfully',
      data: epfForm
    });
  } catch (error: any) {
    console.error('Error creating EPF Form:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating EPF Form'
    });
  }
};

// Get EPF Forms
export const getEPFForms = async (req: Request, res: Response) => {
  try {
    const { employeeId, status } = req.query;
    
    const query: any = {};
    if (employeeId) {
      // Check if employeeId is MongoDB ObjectId
      if (typeof employeeId === 'string' && employeeId.match(/^[0-9a-fA-F]{24}$/)) {
        query.employee = employeeId;
      } else {
        query.employeeId = employeeId;
      }
    }
    if (status) query.status = status;
    
    const forms = await EPFForm.find(query)
      .populate('employee', 'name employeeId email phone department position')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: forms
    });
  } catch (error: any) {
    console.error('Error fetching EPF Forms:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching EPF Forms'
    });
  }
};

// Get single EPF Form
export const getEPFForm = async (req: Request, res: Response) => {
  try {
    const form = await EPFForm.findById(req.params.id)
      .populate('employee', 'name employeeId email phone department position');
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'EPF Form not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: form
    });
  } catch (error: any) {
    console.error('Error fetching EPF Form:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching EPF Form'
    });
  }
};

// Update EPF Form status
export const updateEPFFormStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    
    if (!['draft', 'submitted', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const updateData: any = { status };
    
    if (status === 'submitted') {
      updateData.submittedAt = new Date();
    } else if (status === 'approved') {
      updateData.approvedAt = new Date();
    }
    
    const form = await EPFForm.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('employee', 'name employeeId email phone department position');
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'EPF Form not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'EPF Form status updated successfully',
      data: form
    });
  } catch (error: any) {
    console.error('Error updating EPF Form status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating EPF Form status'
    });
  }
};