import { Request, Response } from 'express';import { Request, Response } from 'express';

import bcrypt from 'bcryptjs';import bcrypt from 'bcryptjs';

import jwt from 'jsonwebtoken';import jwt from 'jsonwebtoken';

import { User, UserRole, UserStatus } from '../models/User';import { User, UserRole, UserStatus } from '../models/User';

import { AppDataSource } from '../config/database';import { AppDataSource } from '../config/database';



export class AuthController {export class AuthController {

  private userRepository = AppDataSource.getRepository(User);  private userRepository = AppDataSource.getRepository(User);



  public login = async (req: Request, res: Response): Promise<void> => {  public login = async (req: Request, res: Response): Promise<void> => {

    try {    try {

      console.log('🚀 LOGIN METHOD CALLED - Request received');      console.log('🚀 LOGIN METHOD CALLED - Request received');

      console.log('Origin header:', req.headers.origin);      console.log('Origin header:', req.headers.origin);



      const { email, username, password, role } = req.body;      const { email, username, password, role } = req.body;



      console.log('🔍 Extracted credentials:', {      console.log('🔍 Extracted credentials:', {

        email,        email,

        username,        username,

        password: password ? '***provided***' : 'missing',        password: password ? '***provided***' : 'missing',

        role        role

      });      });



      // Validation - support both email and username      // Validation - support both email and username

      // Frontend can send either 'username' field (which could be email or username) or separate 'email' field      // Frontend can send either 'username' field (which could be email or username) or separate 'email' field

      const loginField = username || email;      const loginField = username || email;



      console.log('🔍 Login field:', loginField);      console.log('🔍 Login field:', loginField);



      if (!loginField || !password) {      if (!loginField || !password) {

        console.log('❌ Validation failed: missing loginField or password');        console.log('❌ Validation failed: missing loginField or password');

        res.status(400).json({        res.status(400).json({

          success: false,          success: false,

          message: 'Email/Username and password are required'          message: 'Email/Username and password are required'

        });        });

        return;        return;

      }      }



      console.log('🔍 About to query database for user:', loginField);      console.log('🔍 About to query database for user:', loginField);



      // Find user by email or username      // Find user by email or username

      const user = await this.userRepository.findOne({      const user = await this.userRepository.findOne({

        where: [        where: [

          { email: loginField },          { email: loginField },

          { username: loginField }          { username: loginField }

        ]        ]

      });      });



      console.log('🔍 Database query completed');      console.log('🔍 Database query completed');

      console.log('🔍 Debug login:', {      console.log('🔍 Debug login:', {

        loginField,        loginField,

        userFound: !!user,        userFound: !!user,

        username: user?.username,        username: user?.username,

        email: user?.email,        email: user?.email,

        isActive: user?.isActive,        isActive: user?.isActive,

        passwordHash: user?.password?.substring(0, 20) + '...'        passwordHash: user?.password?.substring(0, 20) + '...'

      });      });



      if (!user) {      if (!user) {

        console.log('❌ User not found for loginField:', loginField);        console.log('❌ User not found for loginField:', loginField);

        res.status(401).json({        res.status(401).json({

          success: false,          success: false,

          message: 'Invalid credentials'          message: 'Invalid credentials'

        });        });

        return;        return;

      }      }



      console.log('✅ User found successfully:', {      console.log('✅ User found successfully:', {

        id: user.id,        id: user.id,

        username: user.username,        username: user.username,

        email: user.email,        email: user.email,

        role: user.role,        role: user.role,

        isActive: user.isActive        isActive: user.isActive

      });      });



      // Check if user is active      // Check if user is active

      if (!user.isActive) {      if (!user.isActive) {

        console.log('❌ User is not active:', user.username);        console.log('❌ User is not active:', user.username);

        res.status(401).json({        res.status(401).json({

          success: false,          success: false,

          message: 'Account is deactivated'          message: 'Account is deactivated'

        });        });

        return;        return;

      }      }



      // Verify password      // Verify password

      console.log('🔑 Checking password for user:', user.username);      console.log('🔑 Checking password for user:', user.username);

      console.log('🔑 Input password:', password);      console.log('🔑 Input password:', password);

      console.log('🔑 Stored hash preview:', user.password.substring(0, 30) + '...');      console.log('🔑 Stored hash preview:', user.password.substring(0, 30) + '...');



      let isValidPassword = await bcrypt.compare(password, user.password);      let isValidPassword = await bcrypt.compare(password, user.password);

      console.log('🔑 Password validation result:', isValidPassword);      console.log('🔑 Password validation result:', isValidPassword);



      // Auto-fix password for demo users if validation fails      // Auto-fix password for demo users if validation fails

      if (!isValidPassword && this.isDemoUser(user.username, password)) {      if (!isValidPassword && this.isDemoUser(user.username, password)) {

        console.log('🔧 Auto-fixing password for demo user:', user.username);        console.log('🔧 Auto-fixing password for demo user:', user.username);

        const newHashedPassword = await bcrypt.hash(password, 12);        const newHashedPassword = await bcrypt.hash(password, 12);

        user.password = newHashedPassword;        user.password = newHashedPassword;

        await this.userRepository.save(user);        await this.userRepository.save(user);

        console.log('✅ Demo password auto-fixed for:', user.username);        console.log('✅ Demo password auto-fixed for:', user.username);

        isValidPassword = true;        isValidPassword = true;

      }      }



      if (!isValidPassword) {      if (!isValidPassword) {

        console.log('❌ Password verification failed for user:', user.username);        console.log('❌ Password verification failed for user:', user.username);

        res.status(401).json({        res.status(401).json({

          success: false,          success: false,

          message: 'Invalid credentials'          message: 'Invalid credentials'

        });        });

        return;        return;

      }      }



      console.log('✅ Password verification successful for user:', user.username);      console.log('✅ Password verification successful for user:', user.username);



      // Check role if specified      // Check role if specified

      if (role && user.role !== role) {      if (role && user.role !== role) {

        res.status(403).json({        res.status(403).json({

          success: false,          success: false,

          message: 'Access denied for this role'          message: 'Access denied for this role'

        });        });

        return;        return;

      }      }



      // Generate tokens      // Generate tokens

      const token = this.generateAccessToken(user.id, user.email, user.role);      const token = this.generateAccessToken(user.id, user.email, user.role);

      const refreshToken = this.generateRefreshToken(user.id);      const refreshToken = this.generateRefreshToken(user.id);



      // Update last login      // Update last login

      user.lastLogin = new Date();      user.lastLogin = new Date();

      await this.userRepository.save(user);      await this.userRepository.save(user);



      // Return success response      // Return success response

      res.status(200).json({      res.status(200).json({

        success: true,        success: true,

        message: 'Login successful',        message: 'Login successful',

        data: {        data: {

          user: {          user: {

            id: user.id,            id: user.id,

            username: user.username,            username: user.username,

            email: user.email,            email: user.email,

            fullName: user.fullName,            fullName: user.fullName,

            role: user.role,            role: user.role,

            phone: user.phone,            phone: user.phone,

            avatar: user.avatar,            avatar: user.avatar,

            isActive: user.isActive            isActive: user.isActive

          },          },

          token,          token,

          refreshToken          refreshToken

        }        }

      });      });

    } catch (error) {    } catch (error) {

      console.error('Login error:', error);      console.error('Login error:', error);

      res.status(500).json({      res.status(500).json({

        success: false,        success: false,

        message: 'Internal server error'        message: 'Internal server error'

      });      });

    }    }

  };  };ogin = async (req: Request, res: Response): Promise<void> => {

    try {

  public register = async (req: Request, res: Response): Promise<void> => {      console.log('🚀 LOGIN METHOD CALLED - Request received');

    try {      console.log('Origin header:', req.headers.origin);

      const { username, email, password, fullName, role = UserRole.CUSTOMER, phone } = req.body;      

      const { email, username, password, role } = req.body;st, Response } from 'express';

      // Validationimport bcrypt from 'bcryptjs';

      if (!username || !email || !password || !fullName) {import jwt from 'jsonwebtoken';

        res.status(400).json({import { User, UserRole, UserStatus } from '../models/User';

          success: false,import { AppDataSource } from '../config/database';

          message: 'Username, email, password, and full name are required'

        });export class AuthController {

        return;  private userRepository = AppDataSource.getRepository(User);

      }

  public login = async (req: Request, res: Response): Promise<void> => {

      // Check if user already exists    console.log('� LOGIN METHOD CALLED - Request received');

      const existingUser = await this.userRepository.findOne({    console.log('Origin header:', req.headers.origin);

        where: [      

          { email },      const { email, username, password, role } = req.body;

          { username }

        ]      console.log('🔍 Extracted credentials:', {

      });        email,

        username,

      if (existingUser) {        password: password ? '***provided***' : 'missing',

        res.status(409).json({        role

          success: false,      });

          message: 'User with this email or username already exists'

        });      // Validation - support both email and username

        return;      // Frontend can send either 'username' field (which could be email or username) or separate 'email' field

      }      const loginField = username || email;

      

      // Hash password      console.log('🔍 Login field:', loginField);

      const saltRounds = 12;      

      const hashedPassword = await bcrypt.hash(password, saltRounds);      if (!loginField || !password) {

        console.log('❌ Validation failed: missing loginField or password');

      // Create new user        res.status(400).json({

      const newUser = this.userRepository.create({          success: false,

        username,          message: 'Email/Username and password are required'

        email,        });

        password: hashedPassword,        return;

        fullName,      }

        role,

        phone,      console.log('🔍 About to query database for user:', loginField);

        status: UserStatus.ACTIVE,      

        isActive: true      // Find user by email or username

      });      const user = await this.userRepository.findOne({

        where: [

      const savedUser = await this.userRepository.save(newUser);          { email: loginField },

          { username: loginField }

      // Generate tokens        ]

      const token = this.generateAccessToken(savedUser.id, savedUser.email, savedUser.role);      });

      const refreshToken = this.generateRefreshToken(savedUser.id);

      console.log('🔍 Database query completed');

      res.status(201).json({      console.log('🔍 Debug login:', {

        success: true,        loginField,

        message: 'User registered successfully',        userFound: !!user,

        data: {        username: user?.username,

          user: {        email: user?.email,

            id: savedUser.id,        isActive: user?.isActive,

            username: savedUser.username,        passwordHash: user?.password?.substring(0, 20) + '...'

            email: savedUser.email,      });

            fullName: savedUser.fullName,

            role: savedUser.role,      if (!user) {

            phone: savedUser.phone,        console.log('❌ User not found for loginField:', loginField);

            isActive: savedUser.isActive        res.status(401).json({

          },          success: false,

          token,          message: 'Invalid credentials'

          refreshToken        });

        }        return;

      });      }

    } catch (error) {

      console.error('Registration error:', error);      console.log('✅ User found successfully:', {

      res.status(500).json({        id: user.id,

        success: false,        username: user.username,

        message: 'Internal server error'        email: user.email,

      });        role: user.role,

    }        isActive: user.isActive

  };      });



  public logout = async (req: Request, res: Response): Promise<void> => {      // Check if user is active

    try {      if (!user.isActive) {

      // In a real application, you might want to blacklist the token        console.log('❌ User is not active:', user.username);

      // For now, we'll just return success as the client should remove the token        res.status(401).json({

      res.status(200).json({          success: false,

        success: true,          message: 'Account is deactivated'

        message: 'Logout successful'        });

      });        return;

    } catch (error) {      }

      console.error('Logout error:', error);

      res.status(500).json({      // Verify password

        success: false,      console.log('🔑 Checking password for user:', user.username);

        message: 'Internal server error'      console.log('🔑 Input password:', password);

      });      console.log('🔑 Stored hash preview:', user.password.substring(0, 30) + '...');

    }      

  };      let isValidPassword = await bcrypt.compare(password, user.password);

      console.log('🔑 Password validation result:', isValidPassword);

  public resetAdminPassword = async (req: Request, res: Response): Promise<void> => {      

    try {      // Auto-fix password for demo users if validation fails

      const { newPassword, confirmPassword } = req.body;      if (!isValidPassword && this.isDemoUser(user.username, password)) {

        console.log('🔧 Auto-fixing password for demo user:', user.username);

      // Validation        const newHashedPassword = await bcrypt.hash(password, 12);

      if (!newPassword || !confirmPassword) {        user.password = newHashedPassword;

        res.status(400).json({        await this.userRepository.save(user);

          success: false,        console.log('✅ Demo password auto-fixed for:', user.username);

          message: 'New password and confirmation are required'        isValidPassword = true;

        });      }

        return;      

      }      if (!isValidPassword) {

        console.log('❌ Password verification failed for user:', user.username);

      if (newPassword !== confirmPassword) {        res.status(401).json({

        res.status(400).json({          success: false,

          success: false,          message: 'Invalid credentials'

          message: 'Passwords do not match'        });

        });        return;

        return;      }

      }

      console.log('✅ Password verification successful for user:', user.username);

      if (newPassword.length < 6) {

        res.status(400).json({      // Check role if specified

          success: false,      if (role && user.role !== role) {

          message: 'Password must be at least 6 characters long'        res.status(403).json({

        });          success: false,

        return;          message: 'Access denied for this role'

      }        });

        return;

      // Find admin user      }

      const adminUser = await this.userRepository.findOne({

        where: { role: UserRole.ADMIN }      // Generate tokens

      });      const token = this.generateAccessToken(user.id, user.email, user.role);

      const refreshToken = this.generateRefreshToken(user.id);

      if (!adminUser) {

        res.status(404).json({      // Update last login

          success: false,      user.lastLogin = new Date();

          message: 'Admin user not found'      await this.userRepository.save(user);

        });

        return;      // Return success response

      }      res.status(200).json({

        success: true,

      // Hash new password        message: 'Login successful',

      const saltRounds = 12;        data: {

      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);          user: {

            id: user.id,

      // Update admin password            username: user.username,

      adminUser.password = hashedPassword;            email: user.email,

      await this.userRepository.save(adminUser);            fullName: user.fullName,

            role: user.role,

      console.log('✅ Admin password reset successfully');            phone: user.phone,

            avatar: user.avatar,

      res.status(200).json({            isActive: user.isActive

        success: true,          },

        message: 'Admin password reset successfully'          token,

      });          refreshToken

    } catch (error) {        }

      console.error('Reset admin password error:', error);      });

      res.status(500).json({    } catch (error) {

        success: false,      console.error('Login error:', error);

        message: 'Internal server error'      res.status(500).json({

      });        success: false,

    }        message: 'Internal server error'

  };      });

    }

  public refreshToken = async (req: Request, res: Response): Promise<void> => {  };

    try {

      const { refreshToken } = req.body;  public register = async (req: Request, res: Response): Promise<void> => {

    try {

      if (!refreshToken) {      const { username, email, password, fullName, role = UserRole.CUSTOMER, phone } = req.body;

        res.status(400).json({

          success: false,      // Validation

          message: 'Refresh token is required'      if (!username || !email || !password || !fullName) {

        });        res.status(400).json({

        return;          success: false,

      }          message: 'Username, email, password, and full name are required'

        });

      // Verify refresh token        return;

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh-secret') as any;      }



      // Find user      // Check if user already exists

      const user = await this.userRepository.findOne({      const existingUser = await this.userRepository.findOne({

        where: { id: decoded.userId }        where: [

      });          { email },

          { username }

      if (!user || !user.isActive) {        ]

        res.status(401).json({      });

          success: false,

          message: 'Invalid refresh token'      if (existingUser) {

        });        res.status(409).json({

        return;          success: false,

      }          message: 'User with this email or username already exists'

        });

      // Generate new access token        return;

      const newToken = this.generateAccessToken(user.id, user.email, user.role);      }



      res.status(200).json({      // Hash password

        success: true,      const saltRounds = 12;

        message: 'Token refreshed successfully',      const hashedPassword = await bcrypt.hash(password, saltRounds);

        data: {

          user: {      // Create new user

            id: user.id,      const newUser = this.userRepository.create({

            username: user.username,        username,

            email: user.email,        email,

            fullName: user.fullName,        password: hashedPassword,

            role: user.role,        fullName,

            phone: user.phone,        role,

            avatar: user.avatar,        phone,

            isActive: user.isActive        status: UserStatus.ACTIVE,

          },        isActive: true

          token: newToken      });

        }

      });      const savedUser = await this.userRepository.save(newUser);

    } catch (error) {

      console.error('Token refresh error:', error);      // Generate tokens

      res.status(401).json({      const token = this.generateAccessToken(savedUser.id, savedUser.email, savedUser.role);

        success: false,      const refreshToken = this.generateRefreshToken(savedUser.id);

        message: 'Invalid refresh token'

      });      res.status(201).json({

    }        success: true,

  };        message: 'User registered successfully',

        data: {

  public me = async (req: Request, res: Response): Promise<void> => {          user: {

    try {            id: savedUser.id,

      const userId = (req as any).user?.id;            username: savedUser.username,

            email: savedUser.email,

      if (!userId) {            fullName: savedUser.fullName,

        res.status(401).json({            role: savedUser.role,

          success: false,            phone: savedUser.phone,

          message: 'Unauthorized'            isActive: savedUser.isActive

        });          },

        return;          token,

      }          refreshToken

        }

      const user = await this.userRepository.findOne({      });

        where: { id: userId }    } catch (error) {

      });      console.error('Registration error:', error);

      res.status(500).json({

      if (!user) {        success: false,

        res.status(404).json({        message: 'Internal server error'

          success: false,      });

          message: 'User not found'    }

        });  };

        return;

      }  public logout = async (req: Request, res: Response): Promise<void> => {

    try {

      res.status(200).json({      // In a real application, you might want to blacklist the token

        success: true,      // For now, we'll just return success as the client should remove the token

        data: {      res.status(200).json({

          id: user.id,        success: true,

          username: user.username,        message: 'Logout successful'

          email: user.email,      });

          fullName: user.fullName,    } catch (error) {

          role: user.role,      console.error('Logout error:', error);

          phone: user.phone,      res.status(500).json({

          avatar: user.avatar,        success: false,

          isActive: user.isActive        message: 'Internal server error'

        }      });

      });    }

    } catch (error) {  };

      console.error('Get current user error:', error);

      res.status(500).json({  public resetAdminPassword = async (req: Request, res: Response): Promise<void> => {

        success: false,    try {

        message: 'Internal server error'      const { newPassword, confirmPassword } = req.body;

      });

    }      // Validation

  };      if (!newPassword || !confirmPassword) {

        res.status(400).json({

  public updateProfile = async (req: Request, res: Response): Promise<void> => {          success: false,

    try {          message: 'New password and confirmation are required'

      const userId = (req as any).user?.id;        });

      const { fullName, phone, avatar } = req.body;        return;

      }

      if (!userId) {

        res.status(401).json({      if (newPassword !== confirmPassword) {

          success: false,        res.status(400).json({

          message: 'Unauthorized'          success: false,

        });          message: 'Passwords do not match'

        return;        });

      }        return;

      }

      const user = await this.userRepository.findOne({

        where: { id: userId }      if (newPassword.length < 6) {

      });        res.status(400).json({

          success: false,

      if (!user) {          message: 'Password must be at least 6 characters long'

        res.status(404).json({        });

          success: false,        return;

          message: 'User not found'      }

        });

        return;      // Find admin user

      }      const adminUser = await this.userRepository.findOne({

        where: { role: UserRole.ADMIN }

      // Update user fields      });

      if (fullName) user.fullName = fullName;

      if (phone) user.phone = phone;      if (!adminUser) {

      if (avatar) user.avatar = avatar;        res.status(404).json({

      user.updatedAt = new Date();          success: false,

          message: 'Admin user not found'

      const updatedUser = await this.userRepository.save(user);        });

        return;

      res.status(200).json({      }

        success: true,

        message: 'Profile updated successfully',      // Hash new password

        data: {      const saltRounds = 12;

          id: updatedUser.id,      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

          username: updatedUser.username,

          email: updatedUser.email,      // Update admin password

          fullName: updatedUser.fullName,      adminUser.password = hashedPassword;

          role: updatedUser.role,      await this.userRepository.save(adminUser);

          phone: updatedUser.phone,

          avatar: updatedUser.avatar,      console.log('✅ Admin password reset successfully');

          isActive: updatedUser.isActive

        }      res.status(200).json({

      });        success: true,

    } catch (error) {        message: 'Admin password reset successfully'

      console.error('Update profile error:', error);      });

      res.status(500).json({    } catch (error) {

        success: false,      console.error('Reset admin password error:', error);

        message: 'Internal server error'      res.status(500).json({

      });        success: false,

    }        message: 'Internal server error'

  };      });

    }

  /**  };

   * Check if user is a demo user with expected credentials

   * This allows auto-fixing of demo passwords for development  public refreshToken = async (req: Request, res: Response): Promise<void> => {

   */    try {

  private isDemoUser(username: string, password: string): boolean {      const { refreshToken } = req.body;

    const demoCredentials: { [key: string]: string } = {

      'admin': 'admin123',      if (!refreshToken) {

      'kasir1': 'kasir123',        res.status(400).json({

      'waiter1': 'waiter123',          success: false,

      'customer1': 'customer123'          message: 'Refresh token is required'

    };        });

        return;

    return demoCredentials[username] === password;      }

  }

      // Verify refresh token

  private generateAccessToken(userId: string, email: string, role: string): string {      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh-secret') as any;

    return jwt.sign(      

      { userId, email, role },      // Find user

      process.env.JWT_SECRET || 'your-secret-key',      const user = await this.userRepository.findOne({

      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } as jwt.SignOptions        where: { id: decoded.userId }

    );      });

  }

      if (!user || !user.isActive) {

  private generateRefreshToken(userId: string): string {        res.status(401).json({

    return jwt.sign(          success: false,

      { userId },          message: 'Invalid refresh token'

      process.env.JWT_REFRESH_SECRET || 'refresh-secret',        });

      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as jwt.SignOptions        return;

    );      }

  }

}      // Generate new access token

      const newToken = this.generateAccessToken(user.id, user.email, user.role);

export default new AuthController();
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
      'customer1': 'customer123'
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
