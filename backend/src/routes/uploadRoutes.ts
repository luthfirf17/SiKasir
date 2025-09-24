import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
const menuImagesDir = path.join(uploadsDir, 'menu');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(menuImagesDir)) {
  fs.mkdirSync(menuImagesDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Since req.body is not available in multer destination, we'll use default menu folder
    // and handle folder selection in the route handler
    const targetDir = path.join(uploadsDir, 'menu');
    
    // Create folder if it doesn't exist
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: uuid + original extension
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter for images only
const fileFilter = (req: Request, file: any, cb: any) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('File harus berupa gambar!'), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Upload image endpoint
router.post('/image', upload.single('image'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Get folder from request body (now available after multer processing)
    const requestedFolder = req.body.folder || 'general';
    
    // If user requested different folder, move the file
    if (requestedFolder !== 'menu') {
      const currentPath = req.file.path; // Current location (menu folder)
      const targetFolder = path.join(uploadsDir, requestedFolder);
      
      // Create target folder if it doesn't exist
      if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
      }
      
      const newPath = path.join(targetFolder, req.file.filename);
      
      // Move the file to correct folder
      fs.renameSync(currentPath, newPath);
    }

    const imageURL = `/uploads/${requestedFolder}/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imageURL,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete image endpoint
router.delete('/image', (req: Request, res: Response) => {
  try {
    const { imageURL } = req.body;
    
    if (!imageURL) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    // Convert URL to file path
    const filePath = path.join(process.cwd(), imageURL);
    
    // Check if file exists and delete it
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Delete failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
