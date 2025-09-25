import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import jwt from 'jsonwebtoken';
import { User, UserRole, UserStatus } from '../models/User';
import { AppDataSource } from '../config/database';

export class UserController {
  private userRepository = AppDataSource.getRepository(User);

  // Get all users with pagination and filtering
  public getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        role = '',
        status = ''
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const offset = (pageNum - 1) * limitNum;

      // Build query
      let query = this.userRepository
        .createQueryBuilder('user')
        .select([
          'user.id',
          'user.username',
          'user.email',
          'user.fullName',
          'user.role',
          'user.status',
          'user.phone',
          'user.address',
          'user.avatar',
          'user.isActive',
          'user.createdAt',
          'user.updatedAt',
          'user.lastLogin'
        ]);

      // Add search filter
      if (search) {
        query = query.where(
          '(user.username ILIKE :search OR user.email ILIKE :search OR user.fullName ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      // Add role filter
      if (role) {
        query = query.andWhere('user.role = :role', { role });
      }

      // Add status filter
      if (status) {
        query = query.andWhere('user.status = :status', { status });
      }

      // Get total count
      const totalQuery = query.clone();
      const total = await totalQuery.getCount();

      // Apply pagination and sorting
      const users = await query
        .orderBy('user.createdAt', 'DESC')
        .skip(offset)
        .take(limitNum)
        .getMany();

      res.status(200).json({
        success: true,
        data: {
          users,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
          }
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // Get user by ID
  public getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const user = await this.userRepository.findOne({
        where: { id },
        select: [
          'id',
          'username',
          'email',
          'fullName',
          'role',
          'status',
          'phone',
          'address',
          'avatar',
          'isActive',
          'createdAt',
          'updatedAt',
          'lastLogin'
        ]
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // Create new user
  public createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('🚀 CREATE USER METHOD CALLED');
      console.log('📨 Request body:', JSON.stringify(req.body, null, 2));

      // Also write to file for debugging
      const fs = require('fs');
      const logEntry = {
        timestamp: new Date().toISOString(),
        method: 'createUser',
        body: req.body
      };
      fs.appendFileSync('/tmp/user_creation_debug.log', JSON.stringify(logEntry, null, 2) + '\n---\n');
      const {
        username,
        email,
        password,
        fullName,
        role = UserRole.KASIR,
        status = UserStatus.ACTIVE,
        phone,
        address,
        avatar,
        isActive = true
      } = req.body;

      // Debug logging
      console.log(`👤 Creating user: ${username}`);
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Password received: ${password ? '[HIDDEN]' : 'NULL'}`);
      console.log(`🔑 Password length: ${password ? password.length : 0}`);

      // Validation
      if (!username || !email || !password || !fullName) {
        res.status(400).json({
          success: false,
          message: 'Username, email, password, and full name are required'
        });
        return;
      }

      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: [
          { username },
          { email }
        ]
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'User with this username or email already exists'
        });
        return;
      }

      // Hash password
      console.log(`🔐 Hashing password with bcrypt...`);
      const hashedPassword = await bcrypt.hash(password, 10); // Use 10 rounds as per .env
      console.log(`🔒 Generated hash: ${hashedPassword.substring(0, 20)}...`);

      // Create user
      console.log(`💾 Creating user in database...`);
      const user = this.userRepository.create({
        username,
        email,
        password: hashedPassword,
        fullName,
        role,
        status,
        phone,
        address,
        avatar,
        isActive
      });

      const savedUser = await this.userRepository.save(user);
      console.log(`✅ User created with ID: ${savedUser.id}`);
      console.log(`🔑 Final stored password hash: ${savedUser.password.substring(0, 20)}...`);

      // Return user without password
      const { password: _, ...userResponse } = savedUser;

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: { user: userResponse }
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // Update user
  public updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const {
        username,
        email,
        fullName,
        role,
        status,
        phone,
        address,
        avatar,
        isActive
      } = req.body;

      const user = await this.userRepository.findOne({ where: { id } });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Check for duplicate username/email if they're being changed
      if (username && username !== user.username) {
        const existingUsername = await this.userRepository.findOne({
          where: { username }
        });
        if (existingUsername) {
          res.status(409).json({
            success: false,
            message: 'Username already exists'
          });
          return;
        }
      }

      if (email && email !== user.email) {
        const existingEmail = await this.userRepository.findOne({
          where: { email }
        });
        if (existingEmail) {
          res.status(409).json({
            success: false,
            message: 'Email already exists'
          });
          return;
        }
      }

      // Update user
      if (username !== undefined) user.username = username;
      if (email !== undefined) user.email = email;
      if (fullName !== undefined) user.fullName = fullName;
      if (role !== undefined) user.role = role;
      if (status !== undefined) user.status = status;
      if (phone !== undefined) user.phone = phone;
      if (address !== undefined) user.address = address;
      if (avatar !== undefined) user.avatar = avatar;
      if (isActive !== undefined) user.isActive = isActive;

      const updatedUser = await this.userRepository.save(user);

      // Return user without password
      const { password: _, ...userResponse } = updatedUser;

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: { user: userResponse }
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // Delete user
  public deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const user = await this.userRepository.findOne({ where: { id } });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Prevent deleting admin users
      if (user.role === UserRole.ADMIN) {
        res.status(403).json({
          success: false,
          message: 'Cannot delete admin users'
        });
        return;
      }

      await this.userRepository.remove(user);

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // Change user password
  public changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;

      if (!newPassword) {
        res.status(400).json({
          success: false,
          message: 'New password is required'
        });
        return;
      }

      const user = await this.userRepository.findOne({ where: { id } });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Verify current password if provided
      if (currentPassword) {
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
          res.status(400).json({
            success: false,
            message: 'Current password is incorrect'
          });
          return;
        }
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedPassword;

      await this.userRepository.save(user);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
}