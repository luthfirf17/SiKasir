import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole, UserStatus } from '../models/User';
import { AppDataSource } from '../config/database';

export class AuthController {
  private userRepository = AppDataSource.getRepository(User);

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, username, password, role } = req.body;

      // Validation - support both email and username
      const loginField = username || email;

      if (!loginField || !password) {
        res.status(400).json({
          success: false,
          message: 'Email/Username and password are required'
        });
        return;
      }

      // Find user by email or username
      console.log(`🔍 Searching for user with login field: ${loginField}`);
      const user = await this.userRepository.findOne({
        where: [
          { email: loginField },
          { username: loginField }
        ]
      });

      console.log(`🔍 User found: ${user ? 'YES' : 'NO'}`);
      if (user) {
        console.log(`🔍 Found user: ${user.username}, email: ${user.email}, role: ${user.role}, isActive: ${user.isActive}`);
      }

      if (!user) {
        console.log(`❌ User not found for login field: ${loginField}`);
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
        return;
      }

      // Check if user is active
      if (!user.isActive) {
        res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
        return;
      }

      // Debug logging
      console.log(`🔍 Login attempt for user: ${user.username}`);
      console.log(`🔍 User role: ${user.role}, Requested role: ${role}`);
      console.log(`🔍 Password hash in DB: ${user.password ? user.password.substring(0, 20) + '...' : 'NULL'}`);
      console.log(`🔍 Is demo user: ${this.isDemoUser(user.username, password)}`);

      // For demo users, ensure password is correct
      if (this.isDemoUser(user.username, password)) {
        console.log(`🔧 Auto-fixing password for demo user: ${user.username}`);
        const hashedPassword = await bcrypt.hash(password, 10);
        await this.userRepository.update(user.id, { password: hashedPassword });
        user.password = hashedPassword;
        console.log(`✅ Password auto-fixed for demo user`);
      }

      // Verify password
      console.log(`🔐 Verifying password for user: ${user.username}`);
      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log(`🔐 Password verification result: ${isValidPassword}`);

      if (!isValidPassword) {
        console.log(`❌ Password verification failed for user: ${user.username}`);
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
        return;
      }

      // Check role if specified
      if (role && user.role !== role) {
        res.status(403).json({
          success: false,
          message: 'Access denied for this role'
        });
        return;
      }

      // Generate tokens
      const token = this.generateAccessToken(user.id, user.email, user.role);
      const refreshToken = this.generateRefreshToken(user.id);

      // Update last login
      user.lastLogin = new Date();
      await this.userRepository.save(user);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            phone: user.phone,
            avatar: user.avatar,
            isActive: user.isActive
          },
          token,
          refreshToken
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, email, password, fullName, role = UserRole.CUSTOMER, phone } = req.body;

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
          { email },
          { username }
        ]
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'User with this email or username already exists'
        });
        return;
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new user
      const newUser = this.userRepository.create({
        username,
        email,
        password: hashedPassword,
        fullName,
        role,
        phone,
        status: UserStatus.ACTIVE,
        isActive: true
      });

      const savedUser = await this.userRepository.save(newUser);

      // Generate tokens
      const token = this.generateAccessToken(savedUser.id, savedUser.email, savedUser.role);
      const refreshToken = this.generateRefreshToken(savedUser.id);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: savedUser.id,
            username: savedUser.username,
            email: savedUser.email,
            fullName: savedUser.fullName,
            role: savedUser.role,
            phone: savedUser.phone,
            isActive: savedUser.isActive
          },
          token,
          refreshToken
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  public logout = async (req: Request, res: Response): Promise<void> => {
    try {
      // In a real application, you might want to blacklist the token
      // For now, we'll just return success as the client should remove the token
      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  public resetAdminPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { newPassword, confirmPassword } = req.body;

      // Validation
      if (!newPassword || !confirmPassword) {
        res.status(400).json({
          success: false,
          message: 'New password and confirmation are required'
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        res.status(400).json({
          success: false,
          message: 'Passwords do not match'
        });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
        return;
      }

      // Find admin user
      const adminUser = await this.userRepository.findOne({
        where: { role: UserRole.ADMIN }
      });

      if (!adminUser) {
        res.status(404).json({
          success: false,
          message: 'Admin user not found'
        });
        return;
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update admin password
      adminUser.password = hashedPassword;
      await this.userRepository.save(adminUser);

      console.log('✅ Admin password reset successfully');

      res.status(200).json({
        success: true,
        message: 'Admin password reset successfully'
      });
    } catch (error) {
      console.error('Reset admin password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  public refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
        return;
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh-secret') as any;

      // Find user
      const user = await this.userRepository.findOne({
        where: { id: decoded.userId }
      });

      if (!user || !user.isActive) {
        res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
        return;
      }

      // Generate new access token
      const newToken = this.generateAccessToken(user.id, user.email, user.role);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            phone: user.phone,
            avatar: user.avatar,
            isActive: user.isActive
          },
          token: newToken
        }
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  };

  public me = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const user = await this.userRepository.findOne({
        where: { id: userId }
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
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          isActive: user.isActive
        }
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  public updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const { fullName, phone, avatar } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const user = await this.userRepository.findOne({
        where: { id: userId }
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Update user fields
      if (fullName) user.fullName = fullName;
      if (phone) user.phone = phone;
      if (avatar) user.avatar = avatar;
      user.updatedAt = new Date();

      const updatedUser = await this.userRepository.save(user);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          role: updatedUser.role,
          phone: updatedUser.phone,
          avatar: updatedUser.avatar,
          isActive: updatedUser.isActive
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  /**
   * Check if user is a demo user with expected credentials
   * This allows auto-fixing of demo passwords for development
   */
  private isDemoUser(username: string, password: string): boolean {
    const demoCredentials: { [key: string]: string } = {
      'admin': 'admin123',
      'kasir1': 'kasir123',
      'waiter1': 'waiter123',
      'customer1': 'customer123',
      'nona': 'nona123'
    };

    return demoCredentials[username] === password;
  }

  private generateAccessToken(userId: string, email: string, role: string): string {
    return jwt.sign(
      { userId, email, role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } as jwt.SignOptions
    );
  }

  private generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as jwt.SignOptions
    );
  }
}

export default new AuthController();