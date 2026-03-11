import { Request, Response } from 'express';
import Employee, { IEmployee } from '../models/Employee';
import { 
  uploadImageToCloudinary, 
  uploadSignatureToCloudinary 
} from '../utils/CloudinaryUtils';

// Generate unique employee ID
const generateEmployeeId = async (): Promise<string> => {
  try {
    // Get the latest employee sorted by employeeId in descending order
    const latestEmployee = await Employee.findOne().sort({ employeeId: -1 });
    
    if (!latestEmployee) {
      return 'SKEMP0001';
    }
    
    // Extract the numeric part from the latest employee ID
    const latestId = latestEmployee.employeeId;
    
    // Handle both SKEMP and EMP formats
    let numericPart = 0;
    
    if (latestId.startsWith('SKEMP')) {
      numericPart = parseInt(latestId.replace('SKEMP', '')) || 0;
    } else if (latestId.startsWith('EMP')) {
      numericPart = parseInt(latestId.replace('EMP', '')) || 0;
    } else {
      // If format is unknown, find the highest numeric value
      const allEmployees = await Employee.find().select('employeeId');
      const numericIds = allEmployees
        .map(emp => {
          const id = emp.employeeId;
          const matches = id.match(/\d+/);
          return matches ? parseInt(matches[0]) : 0;
        })
        .filter(num => !isNaN(num));
      
      numericPart = numericIds.length > 0 ? Math.max(...numericIds) : 0;
    }
    
    const newNumericPart = numericPart + 1;
    
    // Return in SKEMP format with 4-digit zero padding
    return `SKEMP${String(newNumericPart).padStart(4, '0')}`;
    
  } catch (error) {
    console.error('Error generating employee ID:', error);
    
    // Fallback: use timestamp
    const timestamp = Date.now().toString().slice(-6);
    return `SKEMP${timestamp}`;
  }
};

// Create a new employee
export const createEmployee = async (req: Request, res: Response) => {
  try {
    console.log('Creating employee with data:', req.body);
    console.log('Files received:', req.files);
    
    // Check for existing employee with same email or Aadhar
    const existingEmployee = await Employee.findOne({
      $or: [
        { email: req.body.email },
        { aadharNumber: req.body.aadharNumber }
      ]
    });
    
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this email or Aadhar number already exists'
      });
    }
    
    let photoUrl = '';
    let photoPublicId = '';
    let employeeSignatureUrl = '';
    let employeeSignaturePublicId = '';
    let authorizedSignatureUrl = '';
    let authorizedSignaturePublicId = '';

    // Handle photo upload
    if (req.files && (req.files as any).photo) {
      try {
        const photoFile = (req.files as any).photo[0];
        console.log('Uploading photo to Cloudinary...');
        const photoResult = await uploadImageToCloudinary(photoFile.buffer, 'employee-photos');
        photoUrl = photoResult.secure_url;
        photoPublicId = photoResult.public_id;
        console.log('Photo uploaded to Cloudinary:', photoUrl);
      } catch (photoError) {
        console.error('Error uploading photo to Cloudinary:', photoError);
        // Continue without photo - don't fail the entire creation
      }
    }

    // Handle employee signature upload
    if (req.files && (req.files as any).employeeSignature) {
      try {
        const signatureFile = (req.files as any).employeeSignature[0];
        console.log('Uploading employee signature to Cloudinary...');
        const signatureResult = await uploadSignatureToCloudinary(signatureFile.buffer, 'employee-signatures');
        employeeSignatureUrl = signatureResult.secure_url;
        employeeSignaturePublicId = signatureResult.public_id;
        console.log('Employee signature uploaded to Cloudinary:', employeeSignatureUrl);
      } catch (sigError) {
        console.error('Error uploading employee signature to Cloudinary:', sigError);
      }
    }

    // Handle authorized signature upload
    if (req.files && (req.files as any).authorizedSignature) {
      try {
        const authSigFile = (req.files as any).authorizedSignature[0];
        console.log('Uploading authorized signature to Cloudinary...');
        const authSigResult = await uploadSignatureToCloudinary(authSigFile.buffer, 'authorized-signatures');
        authorizedSignatureUrl = authSigResult.secure_url;
        authorizedSignaturePublicId = authSigResult.public_id;
        console.log('Authorized signature uploaded to Cloudinary:', authorizedSignatureUrl);
      } catch (authSigError) {
        console.error('Error uploading authorized signature to Cloudinary:', authSigError);
      }
    }

    // Generate unique employee ID
    const employeeId = await generateEmployeeId();
    console.log('Generated employee ID:', employeeId);

    // Parse salary to number
    const salary = req.body.salary ? parseFloat(req.body.salary) : 0;

    // Parse date fields
    const dateOfBirth = req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : undefined;
    const dateOfJoining = req.body.dateOfJoining ? new Date(req.body.dateOfJoining) : new Date();
    const dateOfExit = req.body.dateOfExit ? new Date(req.body.dateOfExit) : undefined;

    // Parse boolean fields
    const idCardIssued = req.body.idCardIssued === 'true' || req.body.idCardIssued === true;
    const westcoatIssued = req.body.westcoatIssued === 'true' || req.body.westcoatIssued === true;
    const apronIssued = req.body.apronIssued === 'true' || req.body.apronIssued === true;

    // Parse numeric fields
    const numberOfChildren = req.body.numberOfChildren ? parseInt(req.body.numberOfChildren) : 0;

    // Create employee object
    const employeeData: Partial<IEmployee> = {
      employeeId,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      aadharNumber: req.body.aadharNumber,
      panNumber: req.body.panNumber,
      esicNumber: req.body.esicNumber,
      uanNumber: req.body.uanNumber,
      
      // Personal Details
      dateOfBirth,
      dateOfJoining,
      dateOfExit,
      bloodGroup: req.body.bloodGroup,
      gender: req.body.gender,
      maritalStatus: req.body.maritalStatus,
      
      // Address
      permanentAddress: req.body.permanentAddress,
      permanentPincode: req.body.permanentPincode,
      localAddress: req.body.localAddress,
      localPincode: req.body.localPincode,
      
      // Bank Details
      bankName: req.body.bankName,
      accountNumber: req.body.accountNumber,
      ifscCode: req.body.ifscCode,
      branchName: req.body.branchName,
      bankBranch: req.body.branchName, // Alias for compatibility
      
      // Family Details
      fatherName: req.body.fatherName,
      motherName: req.body.motherName,
      spouseName: req.body.spouseName,
      numberOfChildren,
      
      // Emergency Contact
      emergencyContactName: req.body.emergencyContactName,
      emergencyContactPhone: req.body.emergencyContactPhone,
      emergencyContactRelation: req.body.emergencyContactRelation,
      
      // Nominee Details
      nomineeName: req.body.nomineeName,
      nomineeRelation: req.body.nomineeRelation,
      
      // Employment Details
      department: req.body.department,
      position: req.body.position,
      siteName: req.body.siteName,
      salary,
      status: 'active' as const,
      role: 'employee' as const,
      
      // Uniform Details
      pantSize: req.body.pantSize,
      shirtSize: req.body.shirtSize,
      capSize: req.body.capSize,
      
      // Issued Items
      idCardIssued,
      westcoatIssued,
      apronIssued,
      
      // Cloudinary URLs
      photo: photoUrl,
      photoPublicId,
      employeeSignature: employeeSignatureUrl,
      employeeSignaturePublicId,
      authorizedSignature: authorizedSignatureUrl,
      authorizedSignaturePublicId,
    };

    console.log('Creating employee with data:', employeeData);

    // Create and save employee
    const employee = new Employee(employeeData);
    const savedEmployee = await employee.save();

    console.log('Employee created successfully:', savedEmployee._id);

    // Return the full employee object with all fields
    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      employee: savedEmployee
    });

  } catch (error: any) {
    console.error('Error creating employee:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      console.error('Duplicate key error details:', error.keyPattern);
      
      let message = 'Duplicate value entered';
      const field = Object.keys(error.keyPattern)[0];
      
      if (field === 'email') message = 'Email already exists';
      else if (field === 'aadharNumber') message = 'Aadhar number already exists';
      else if (field === 'employeeId') {
        message = 'Employee ID conflict. Please try again.';
      }
      
      return res.status(400).json({
        success: false,
        message,
        error: error.message,
        field
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating employee',
      error: error.message
    });
  }
};

// Get all employees
export const getEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: employees.length,
      employees
    });
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employees',
      error: error.message
    });
  }
};

// Get employee by ID or employeeId
export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    let employee;
    
    // Check if the id is a MongoDB ObjectId (24 hex characters)
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      employee = await Employee.findById(id);
    } else {
      // If not an ObjectId, search by employeeId
      employee = await Employee.findOne({ employeeId: id });
    }
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    res.status(200).json({
      success: true,
      employee
    });
  } catch (error: any) {
    console.error('Error fetching employee:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employee',
      error: error.message
    });
  }
};

// Update employee - also handle both ID types
export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Handle file uploads if present
    let updateData: any = { ...req.body };
    
    if (req.files) {
      const files = req.files as any;
      
      if (files.photo) {
        const photoFile = files.photo[0];
        const photoResult = await uploadImageToCloudinary(photoFile.buffer, 'employee-photos');
        updateData.photo = photoResult.secure_url;
        updateData.photoPublicId = photoResult.public_id;
      }
      
      if (files.employeeSignature) {
        const sigFile = files.employeeSignature[0];
        const sigResult = await uploadSignatureToCloudinary(sigFile.buffer, 'employee-signatures');
        updateData.employeeSignature = sigResult.secure_url;
        updateData.employeeSignaturePublicId = sigResult.public_id;
      }
      
      if (files.authorizedSignature) {
        const authSigFile = files.authorizedSignature[0];
        const authSigResult = await uploadSignatureToCloudinary(authSigFile.buffer, 'authorized-signatures');
        updateData.authorizedSignature = authSigResult.secure_url;
        updateData.authorizedSignaturePublicId = authSigResult.public_id;
      }
    }
    
    // Parse numeric fields
    if (updateData.salary) updateData.salary = parseFloat(updateData.salary);
    if (updateData.numberOfChildren) updateData.numberOfChildren = parseInt(updateData.numberOfChildren);
    
    // Parse boolean fields
    if (updateData.idCardIssued !== undefined) {
      updateData.idCardIssued = updateData.idCardIssued === 'true' || updateData.idCardIssued === true;
    }
    if (updateData.westcoatIssued !== undefined) {
      updateData.westcoatIssued = updateData.westcoatIssued === 'true' || updateData.westcoatIssued === true;
    }
    if (updateData.apronIssued !== undefined) {
      updateData.apronIssued = updateData.apronIssued === 'true' || updateData.apronIssued === true;
    }
    
    // Parse date fields
    if (updateData.dateOfBirth) updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    if (updateData.dateOfJoining) updateData.dateOfJoining = new Date(updateData.dateOfJoining);
    if (updateData.dateOfExit) updateData.dateOfExit = new Date(updateData.dateOfExit);
    
    let employee;
    
    // Check if the id is a MongoDB ObjectId
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      employee = await Employee.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
    } else {
      // If not an ObjectId, update by employeeId
      employee = await Employee.findOneAndUpdate(
        { employeeId: id },
        updateData,
        { new: true, runValidators: true }
      );
    }
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      employee
    });
  } catch (error: any) {
    console.error('Error updating employee:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating employee',
      error: error.message
    });
  }
};

// Delete employee - also handle both ID types
export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    let employee;
    
    // Check if the id is a MongoDB ObjectId
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      employee = await Employee.findById(id);
    } else {
      // If not an ObjectId, find by employeeId
      employee = await Employee.findOne({ employeeId: id });
    }
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    // Delete from Cloudinary if public IDs exist
    // Note: You might want to import deleteImageFromCloudinary from CloudinaryUtils
    // and call it for each image that needs to be deleted
    
    await employee.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting employee:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting employee',
      error: error.message
    });
  }
};