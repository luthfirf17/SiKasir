import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

export enum LogCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  ORDER_MANAGEMENT = 'order_management',
  PAYMENT_PROCESSING = 'payment_processing',
  INVENTORY_MANAGEMENT = 'inventory_management',
  USER_MANAGEMENT = 'user_management',
  SYSTEM_CONFIGURATION = 'system_configuration',
  DATA_IMPORT_EXPORT = 'data_import_export',
  NOTIFICATION = 'notification',
  ANALYTICS = 'analytics',
  INTEGRATION = 'integration',
  DATABASE = 'database',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  ERROR_HANDLING = 'error_handling',
  BUSINESS_LOGIC = 'business_logic',
  AUDIT_TRAIL = 'audit_trail'
}

export enum LogAction {
  // Authentication & Authorization
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  PASSWORD_CHANGED = 'password_changed',
  PASSWORD_RESET = 'password_reset',
  PERMISSION_GRANTED = 'permission_granted',
  PERMISSION_DENIED = 'permission_denied',

  // CRUD Operations
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  BULK_UPDATE = 'bulk_update',
  BULK_DELETE = 'bulk_delete',

  // Order Management
  ORDER_CREATED = 'order_created',
  ORDER_UPDATED = 'order_updated',
  ORDER_CANCELLED = 'order_cancelled',
  ORDER_COMPLETED = 'order_completed',
  ORDER_REFUNDED = 'order_refunded',

  // Payment Processing
  PAYMENT_INITIATED = 'payment_initiated',
  PAYMENT_COMPLETED = 'payment_completed',
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_REFUNDED = 'payment_refunded',

  // Inventory Management
  STOCK_UPDATED = 'stock_updated',
  STOCK_ALERT = 'stock_alert',
  INVENTORY_COUNTED = 'inventory_counted',
  INVENTORY_ADJUSTED = 'inventory_adjusted',

  // System Operations
  SYSTEM_STARTUP = 'system_startup',
  SYSTEM_SHUTDOWN = 'system_shutdown',
  BACKUP_CREATED = 'backup_created',
  BACKUP_RESTORED = 'backup_restored',
  CONFIGURATION_CHANGED = 'configuration_changed',

  // Data Operations
  DATA_EXPORTED = 'data_exported',
  DATA_IMPORTED = 'data_imported',
  REPORT_GENERATED = 'report_generated',

  // Security Events
  SECURITY_VIOLATION = 'security_violation',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  ACCESS_VIOLATION = 'access_violation',

  // Performance & Errors
  PERFORMANCE_ISSUE = 'performance_issue',
  DATABASE_ERROR = 'database_error',
  EXTERNAL_API_ERROR = 'external_api_error',
  VALIDATION_ERROR = 'validation_error',

  // Custom Actions
  CUSTOM = 'custom'
}

@Entity('system_logs')
@Index(['level', 'createdAt'])
@Index(['category', 'createdAt'])
@Index(['action', 'createdAt'])
@Index(['userId'])
@Index(['entityType', 'entityId'])
@Index(['ipAddress'])
@Index(['sessionId'])
export class SystemLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar', length: 50,
    
    default: LogLevel.INFO
  })
  @Index()
  level!: LogLevel;

  @Column({
    type: 'varchar', length: 50,
    
    default: LogCategory.BUSINESS_LOGIC
  })
  @Index()
  category!: LogCategory;

  @Column({
    type: 'varchar', length: 50,
    
    default: LogAction.CUSTOM
  })
  @Index()
  action!: LogAction;

  @Column({ type: 'varchar', length: 255 })
  message!: string;

  @Column({ type: 'text', nullable: true })
  details?: string; // JSON string with detailed information

  @Column({ type: 'uuid', nullable: true })
  userId?: string; // User who performed the action

  @Column({ type: 'varchar', length: 255, nullable: true })
  userName?: string; // Snapshot of user name

  @Column({ type: 'varchar', length: 100, nullable: true })
  userRole?: string; // Snapshot of user role

  @Column({ type: 'varchar', length: 255, nullable: true })
  sessionId?: string; // Session ID

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string; // IP address

  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent?: string; // Browser/client user agent

  @Column({ type: 'varchar', length: 255, nullable: true })
  requestId?: string; // Request correlation ID

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  entityType?: string; // Type of entity affected (Order, Customer, etc.)

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  entityId?: string; // ID of entity affected

  @Column({ type: 'varchar', length: 255, nullable: true })
  entityName?: string; // Name/description of entity affected

  @Column({ type: 'text', nullable: true })
  oldValues?: string; // JSON string of old values (for updates)

  @Column({ type: 'text', nullable: true })
  newValues?: string; // JSON string of new values (for updates)

  @Column({ type: 'varchar', length: 10, nullable: true })
  httpMethod?: string; // HTTP method (GET, POST, etc.)

  @Column({ type: 'varchar', length: 500, nullable: true })
  endpoint?: string; // API endpoint

  @Column({ type: 'int', nullable: true })
  httpStatusCode?: number; // HTTP response status code

  @Column({ type: 'int', nullable: true })
  responseTime?: number; // Response time in milliseconds

  @Column({ type: 'varchar', length: 255, nullable: true })
  errorCode?: string; // Error code if applicable

  @Column({ type: 'text', nullable: true })
  stackTrace?: string; // Stack trace for errors

  @Column({ type: 'varchar', length: 255, nullable: true })
  module?: string; // System module/component

  @Column({ type: 'varchar', length: 255, nullable: true })
  function?: string; // Function/method name

  @Column({ type: 'text', nullable: true })
  metadata?: string; // Additional metadata as JSON

  @Column({ type: 'boolean', default: false })
  isArchived!: boolean; // Whether this log is archived

  @Column({ type: 'timestamp', nullable: true })
  archivedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  // Computed properties
  get levelDisplayName(): string {
    const levelMap = {
      [LogLevel.DEBUG]: 'Debug',
      [LogLevel.INFO]: 'Info',
      [LogLevel.WARN]: 'Peringatan',
      [LogLevel.ERROR]: 'Error',
      [LogLevel.FATAL]: 'Fatal'
    };
    return levelMap[this.level] || this.level;
  }

  get categoryDisplayName(): string {
    const categoryMap = {
      [LogCategory.AUTHENTICATION]: 'Autentikasi',
      [LogCategory.AUTHORIZATION]: 'Otorisasi',
      [LogCategory.ORDER_MANAGEMENT]: 'Manajemen Pesanan',
      [LogCategory.PAYMENT_PROCESSING]: 'Proses Pembayaran',
      [LogCategory.INVENTORY_MANAGEMENT]: 'Manajemen Inventori',
      [LogCategory.USER_MANAGEMENT]: 'Manajemen Pengguna',
      [LogCategory.SYSTEM_CONFIGURATION]: 'Konfigurasi Sistem',
      [LogCategory.DATA_IMPORT_EXPORT]: 'Import/Export Data',
      [LogCategory.NOTIFICATION]: 'Notifikasi',
      [LogCategory.ANALYTICS]: 'Analitik',
      [LogCategory.INTEGRATION]: 'Integrasi',
      [LogCategory.DATABASE]: 'Database',
      [LogCategory.SECURITY]: 'Keamanan',
      [LogCategory.PERFORMANCE]: 'Performa',
      [LogCategory.ERROR_HANDLING]: 'Error Handling',
      [LogCategory.BUSINESS_LOGIC]: 'Logika Bisnis',
      [LogCategory.AUDIT_TRAIL]: 'Audit Trail'
    };
    return categoryMap[this.category] || this.category;
  }

  get actionDisplayName(): string {
    const actionMap = {
      [LogAction.LOGIN]: 'Login',
      [LogAction.LOGOUT]: 'Logout',
      [LogAction.LOGIN_FAILED]: 'Login Gagal',
      [LogAction.PASSWORD_CHANGED]: 'Password Diubah',
      [LogAction.PASSWORD_RESET]: 'Password Direset',
      [LogAction.PERMISSION_GRANTED]: 'Izin Diberikan',
      [LogAction.PERMISSION_DENIED]: 'Izin Ditolak',
      [LogAction.CREATE]: 'Dibuat',
      [LogAction.READ]: 'Dibaca',
      [LogAction.UPDATE]: 'Diperbarui',
      [LogAction.DELETE]: 'Dihapus',
      [LogAction.BULK_UPDATE]: 'Update Massal',
      [LogAction.BULK_DELETE]: 'Hapus Massal',
      [LogAction.ORDER_CREATED]: 'Pesanan Dibuat',
      [LogAction.ORDER_UPDATED]: 'Pesanan Diperbarui',
      [LogAction.ORDER_CANCELLED]: 'Pesanan Dibatalkan',
      [LogAction.ORDER_COMPLETED]: 'Pesanan Selesai',
      [LogAction.ORDER_REFUNDED]: 'Pesanan Dikembalikan',
      [LogAction.PAYMENT_INITIATED]: 'Pembayaran Dimulai',
      [LogAction.PAYMENT_COMPLETED]: 'Pembayaran Selesai',
      [LogAction.PAYMENT_FAILED]: 'Pembayaran Gagal',
      [LogAction.PAYMENT_REFUNDED]: 'Pembayaran Dikembalikan',
      [LogAction.STOCK_UPDATED]: 'Stok Diperbarui',
      [LogAction.STOCK_ALERT]: 'Peringatan Stok',
      [LogAction.INVENTORY_COUNTED]: 'Inventori Dihitung',
      [LogAction.INVENTORY_ADJUSTED]: 'Inventori Disesuaikan',
      [LogAction.SYSTEM_STARTUP]: 'Sistem Dimulai',
      [LogAction.SYSTEM_SHUTDOWN]: 'Sistem Dimatikan',
      [LogAction.BACKUP_CREATED]: 'Backup Dibuat',
      [LogAction.BACKUP_RESTORED]: 'Backup Dipulihkan',
      [LogAction.CONFIGURATION_CHANGED]: 'Konfigurasi Diubah',
      [LogAction.DATA_EXPORTED]: 'Data Diekspor',
      [LogAction.DATA_IMPORTED]: 'Data Diimpor',
      [LogAction.REPORT_GENERATED]: 'Laporan Dibuat',
      [LogAction.SECURITY_VIOLATION]: 'Pelanggaran Keamanan',
      [LogAction.SUSPICIOUS_ACTIVITY]: 'Aktivitas Mencurigakan',
      [LogAction.ACCESS_VIOLATION]: 'Pelanggaran Akses',
      [LogAction.PERFORMANCE_ISSUE]: 'Masalah Performa',
      [LogAction.DATABASE_ERROR]: 'Error Database',
      [LogAction.EXTERNAL_API_ERROR]: 'Error API Eksternal',
      [LogAction.VALIDATION_ERROR]: 'Error Validasi',
      [LogAction.CUSTOM]: 'Kustom'
    };
    return actionMap[this.action] || this.action;
  }

  get isError(): boolean {
    return this.level === LogLevel.ERROR || this.level === LogLevel.FATAL;
  }

  get isWarning(): boolean {
    return this.level === LogLevel.WARN;
  }

  get isSuccess(): boolean {
    return this.httpStatusCode ? this.httpStatusCode >= 200 && this.httpStatusCode < 300 : false;
  }

  get hasSlowResponse(): boolean {
    return this.responseTime ? this.responseTime > 1000 : false; // More than 1 second
  }

  get severityScore(): number {
    const scoreMap = {
      [LogLevel.DEBUG]: 1,
      [LogLevel.INFO]: 2,
      [LogLevel.WARN]: 3,
      [LogLevel.ERROR]: 4,
      [LogLevel.FATAL]: 5
    };
    return scoreMap[this.level] || 1;
  }

  // Helper methods
  getParsedDetails(): any {
    try {
      return this.details ? JSON.parse(this.details) : {};
    } catch {
      return {};
    }
  }

  setParsedDetails(details: any): void {
    this.details = JSON.stringify(details);
  }

  getParsedOldValues(): any {
    try {
      return this.oldValues ? JSON.parse(this.oldValues) : {};
    } catch {
      return {};
    }
  }

  setParsedOldValues(values: any): void {
    this.oldValues = JSON.stringify(values);
  }

  getParsedNewValues(): any {
    try {
      return this.newValues ? JSON.parse(this.newValues) : {};
    } catch {
      return {};
    }
  }

  setParsedNewValues(values: any): void {
    this.newValues = JSON.stringify(values);
  }

  getParsedMetadata(): any {
    try {
      return this.metadata ? JSON.parse(this.metadata) : {};
    } catch {
      return {};
    }
  }

  setParsedMetadata(metadata: any): void {
    this.metadata = JSON.stringify(metadata);
  }

  // Business logic methods
  archive(): void {
    this.isArchived = true;
    this.archivedAt = new Date();
  }

  unarchive(): void {
    this.isArchived = false;
    this.archivedAt = undefined;
  }

  // Static factory methods
  static createAuthLog(
    action: LogAction,
    message: string,
    userId?: string,
    userName?: string,
    ipAddress?: string,
    success: boolean = true
  ): Partial<SystemLog> {
    return {
      level: success ? LogLevel.INFO : LogLevel.WARN,
      category: LogCategory.AUTHENTICATION,
      action,
      message,
      userId,
      userName,
      ipAddress
    };
  }

  static createErrorLog(
    category: LogCategory,
    message: string,
    error: Error,
    userId?: string,
    entityType?: string,
    entityId?: string
  ): Partial<SystemLog> {
    return {
      level: LogLevel.ERROR,
      category,
      action: LogAction.CUSTOM,
      message,
      details: JSON.stringify({
        error: error.message,
        name: error.name
      }),
      stackTrace: error.stack,
      userId,
      entityType,
      entityId,
      errorCode: error.name
    };
  }

  static createAuditLog(
    action: LogAction,
    entityType: string,
    entityId: string,
    entityName: string,
    userId: string,
    userName: string,
    oldValues?: any,
    newValues?: any
  ): Partial<SystemLog> {
    return {
      level: LogLevel.INFO,
      category: LogCategory.AUDIT_TRAIL,
      action,
      message: `${action} performed on ${entityType}`,
      userId,
      userName,
      entityType,
      entityId,
      entityName,
      oldValues: oldValues ? JSON.stringify(oldValues) : undefined,
      newValues: newValues ? JSON.stringify(newValues) : undefined
    };
  }

  static createPerformanceLog(
    endpoint: string,
    method: string,
    responseTime: number,
    statusCode: number,
    userId?: string
  ): Partial<SystemLog> {
    const level = responseTime > 5000 ? LogLevel.WARN : 
                 responseTime > 1000 ? LogLevel.INFO : LogLevel.DEBUG;

    return {
      level,
      category: LogCategory.PERFORMANCE,
      action: LogAction.PERFORMANCE_ISSUE,
      message: `${method} ${endpoint} took ${responseTime}ms`,
      httpMethod: method,
      endpoint,
      httpStatusCode: statusCode,
      responseTime,
      userId
    };
  }

  static createSecurityLog(
    action: LogAction,
    message: string,
    ipAddress: string,
    userAgent?: string,
    userId?: string,
    severity: LogLevel = LogLevel.WARN
  ): Partial<SystemLog> {
    return {
      level: severity,
      category: LogCategory.SECURITY,
      action,
      message,
      ipAddress,
      userAgent,
      userId
    };
  }

  static createBusinessLog(
    action: LogAction,
    message: string,
    entityType: string,
    entityId: string,
    userId: string,
    details?: any
  ): Partial<SystemLog> {
    return {
      level: LogLevel.INFO,
      category: LogCategory.BUSINESS_LOGIC,
      action,
      message,
      entityType,
      entityId,
      userId,
      details: details ? JSON.stringify(details) : undefined
    };
  }

  // Get summary for dashboard
  getSummary(): {
    level: string;
    category: string;
    action: string;
    message: string;
    timestamp: string;
    user?: string;
    entity?: string;
  } {
    return {
      level: this.levelDisplayName,
      category: this.categoryDisplayName,
      action: this.actionDisplayName,
      message: this.message,
      timestamp: this.createdAt.toLocaleString('id-ID'),
      user: this.userName,
      entity: this.entityName
    };
  }

  // Check if log requires attention
  requiresAttention(): boolean {
    return this.level === LogLevel.ERROR || 
           this.level === LogLevel.FATAL || 
           this.category === LogCategory.SECURITY ||
           (this.responseTime !== undefined && this.responseTime > 5000);
  }
}
