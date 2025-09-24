import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Table, TableStatus, TableArea } from '../models/Table';
import { TableUsageHistory } from '../models/TableUsageHistory';
import { QrCode } from '../models/QrCode';
// import QRCode from 'qrcode';

export class TableController {
  private tableRepository: Repository<Table>;
  private usageHistoryRepository: Repository<TableUsageHistory>;
  private qrCodeRepository: Repository<QrCode>;

  constructor() {
    this.tableRepository = AppDataSource.getRepository(Table);
    this.usageHistoryRepository = AppDataSource.getRepository(TableUsageHistory);
    this.qrCodeRepository = AppDataSource.getRepository(QrCode);
  }

  // Generate a unique table number server-side (T001..T999)
  private generateUniqueTableNumber = async (): Promise<string> => {
    // Fetch existing numbers
    const rows = await this.tableRepository
      .createQueryBuilder('table')
      .select('table.table_number', 'table_number')
      .getRawMany();

    const existing = new Set(rows.map((r: any) => r.table_number));

    for (let i = 1; i <= 999; i++) {
      const candidate = `T${i.toString().padStart(3, '0')}`;
      if (!existing.has(candidate)) return candidate;
    }

    throw new Error('No available table numbers');
  };

  // Get all tables with optional filters
  public getAllTables = async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        status, 
        area, 
        capacity_min, 
        capacity_max, 
        search,
        page = 1, 
        limit = 20 
      } = req.query;

      const query = this.tableRepository.createQueryBuilder('table');

      // Add filters
      if (status) {
        query.andWhere('table.status = :status', { status });
      }
      if (area) {
        query.andWhere('table.location = :area', { area });
      }
      if (capacity_min) {
        query.andWhere('table.capacity >= :capacity_min', { capacity_min });
      }
      if (capacity_max) {
        query.andWhere('table.capacity <= :capacity_max', { capacity_max });
      }
      if (search) {
        query.andWhere(
          '(table.table_number ILIKE :search OR table.location_description ILIKE :search)', 
          { search: `%${search}%` }
        );
      }

      // Add pagination
      const offset = (Number(page) - 1) * Number(limit);
      query.skip(offset).take(Number(limit));

      // Order by table number
      query.orderBy('table.table_number', 'ASC');

      const [tables, total] = await query.getManyAndCount();

      // Map entity properties to frontend-friendly DTO
      const mapped = tables.map((t: any) => ({
        table_id: t.id,
        table_number: t.table_number || (t as any).number || null,
        capacity: t.capacity,
        status: t.status,
        area: t.location || (t as any).area || null,
        location_description: t.location_description || null,
        position_x: t.position_x !== undefined ? t.position_x : null,
        position_y: t.position_y !== undefined ? t.position_y : null,
        notes: t.notes || null,
        created_at: t.created_at || (t as any).createdAt || null,
        updated_at: t.updated_at || (t as any).updatedAt || null,
        // include other virtual relations if present
        qr_codes: t.qr_codes || null,
        orders: t.orders || null,
        reservations: t.reservations || null
      }));

      res.json({
        message: 'Tables retrieved successfully',
        data: mapped,
        pagination: {
          current_page: Number(page),
          per_page: Number(limit),
          total,
          total_pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching tables:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Get table by ID
  public getTableById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const table = await this.tableRepository.findOne({
        where: { id: id },
        relations: ['qr_codes', 'orders', 'reservations']
      });

      if (!table) {
        res.status(404).json({ message: 'Table not found' });
        return;
      }

      const result = {
        table_id: table.id,
        table_number: table.table_number || (table as any).number || null,
        capacity: table.capacity,
        status: table.status,
        area: table.location || (table as any).area || null,
        location_description: table.location_description || null,
        position_x: table.position_x !== undefined ? table.position_x : null,
        position_y: table.position_y !== undefined ? table.position_y : null,
        notes: table.notes || null,
        created_at: table.created_at || (table as any).createdAt || null,
        updated_at: table.updated_at || (table as any).updatedAt || null,
        qr_codes: table.qr_codes || null,
        orders: table.orders || null,
        reservations: table.reservations || null
      };

      res.json({
        message: 'Table retrieved successfully',
        data: result
      });
    } catch (error) {
      console.error('Error fetching table:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Create new table
  public createTable = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Request to create table, body=', JSON.stringify(req.body));
      const {
        table_number,
        capacity,
        area = TableArea.INDOOR,
        location_description,
        position_x,
        position_y,
        notes
      } = req.body;

      // Validation
      if (!table_number || !capacity) {
        res.status(400).json({ message: 'Table number and capacity are required' });
        return;
      }

      // Helper: generate next available T### number server-side to avoid races
      const generateNextTableNumber = async () => {
        // Fetch existing table numbers
        const rows = await this.tableRepository
          .createQueryBuilder('table')
          .select('table.table_number', 'table_number')
          .orderBy('table.table_number', 'ASC')
          .getRawMany();

        const existingNumbers = rows.map((r: any) => r.table_number).filter((n: any) => typeof n === 'string');

        // Try numbers from T001..T999
        for (let i = 1; i <= 999; i++) {
          const candidate = `T${i.toString().padStart(3, '0')}`;
          if (!existingNumbers.includes(candidate)) return candidate;
        }
        return null;
      };

        // Check if table number already exists
        let finalTableNumber = table_number;
        const existingTable = await this.tableRepository.findOne({
          where: { table_number: finalTableNumber }
        });

        if (existingTable) {
          // Jika nomor tabel berbentuk auto-generated seperti T001, coba generate nomor unik baru
          if (/^T\d{3}$/.test(finalTableNumber)) {
            let counter = 1;
            let newNumber = '';
            let foundUnique = false;

            while (counter <= 999) {
              newNumber = `T${counter.toString().padStart(3, '0')}`;
              // cek apakah sudah ada
              // await tiap iterasi karena jumlah tabel biasanya kecil
              // ini mencegah race condition sederhana di level aplikasi
              // jika banyak tabel/performa jadi masalah, ubah menjadi single query
              // yang mengambil semua nomor dan mencari ke dalam array.
              // Namun untuk keringanan implementasi ini cukup.
              // eslint-disable-next-line no-await-in-loop
              const found = await this.tableRepository.findOne({ where: { table_number: newNumber } });
              if (!found) {
                foundUnique = true;
                break;
              }
              counter++;
            }

            if (foundUnique) {
              finalTableNumber = newNumber;
              console.warn(`Table number ${table_number} already exists. Assigned new number ${finalTableNumber}`);
            } else {
              res.status(400).json({ message: 'Table number already exists and no available auto-generated table number found' });
              return;
            }
          } else {
            res.status(400).json({ message: 'Table number already exists' });
            return;
          }
        }

      const table = new Table();
        table.table_number = finalTableNumber;
      table.capacity = Number(capacity);
    // Ensure persisted column `location` is set (area is a virtual getter/setter)
    table.area = area;
    table.location = area;
      table.location_description = location_description;
      table.position_x = position_x !== undefined && position_x !== null ? Number(position_x) : undefined;
      table.position_y = position_y !== undefined && position_y !== null ? Number(position_y) : undefined;
      table.notes = notes;
      table.status = TableStatus.AVAILABLE;

      console.log('About to save table, finalTableNumber=', finalTableNumber, 'payload=', {
        capacity, area, location_description, position_x, position_y, notes
      });
      // Debug: show table object and location value to diagnose NOT NULL saving issue
      try {
        console.log('DEBUG check - hasOwnProperty(location):', Object.prototype.hasOwnProperty.call(table, 'location'));
        console.log('DEBUG check - typeof table.location:', typeof table.location, 'value:', table.location);
        console.log('DEBUG before save - table.location:', table.location);
        console.log('DEBUG before save - table object:', JSON.stringify({
          table_number: table.table_number,
          capacity: table.capacity,
          location: table.location,
          area: table.area,
          status: table.status
        }));
      } catch (dbgErr) {
        // ignore stringify errors
        console.warn('Could not stringify debug table object', dbgErr);
      }
      let savedTable: any;
      try {
        // Use insert to explicitly include `location` and avoid DEFAULT being used
        const insertPayload: any = {
          table_number: finalTableNumber,
          capacity: Number(capacity),
          status: TableStatus.AVAILABLE,
          location: area,
          // only include persisted columns; other fields may be virtual
            location_description,
          position_x: position_x !== undefined && position_x !== null ? Number(position_x) : undefined,
          position_y: position_y !== undefined && position_y !== null ? Number(position_y) : undefined,
            notes
        };
        console.log('DEBUG insertPayload:', JSON.stringify(insertPayload));
        const insertResult = await this.tableRepository.insert(insertPayload);

        const newId = insertResult.identifiers && insertResult.identifiers[0] && insertResult.identifiers[0].id;
        if (newId) {
          savedTable = await this.tableRepository.findOne({ where: { id: newId } });
        } else {
          // fallback: ensure entity has location and save
          table.location = area;
          savedTable = await this.tableRepository.save(table);
        }
      } catch (saveErr) {
        const se: any = saveErr;
        console.error('Error saving table to DB:', se && (se.stack || se));
        // If Postgres unique violation during save, respond with 400
        if ((saveErr as any)?.code === '23505') {
          res.status(400).json({ message: 'Table number already exists (unique constraint)' });
          return;
        }
        // otherwise rethrow to be caught by outer catch
        throw saveErr;
      }

      // Log saved table for debugging
      try {
        console.log('Saved table:', JSON.stringify(savedTable));
      } catch (logErr) {
        console.warn('Could not stringify savedTable for logging', logErr);
      }

      // Generate QR Code for the table but do not allow QR errors to fail the request
      try {
        await this.generateQRCodeForTable(savedTable.id);
      } catch (qrErr) {
        console.error('QR generation failed (non-fatal):', qrErr);
      }

      res.status(201).json({
        message: 'Table created successfully',
        data: savedTable
      });
    } catch (error) {
      const errAny: any = error;
      // Handle Postgres unique violation specifically
      if (errAny && errAny.code === '23505') {
        console.error('Postgres unique violation during createTable:', errAny.detail || errAny.message || errAny);
        res.status(400).json({ message: 'Table number already exists (unique constraint)' });
        return;
      }

      console.error('Error creating table:', errAny && (errAny.stack || errAny));
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Update table
  public updateTable = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
  const updates = req.body;

      const table = await this.tableRepository.findOne({
        where: { id: id }
      });

      if (!table) {
        res.status(404).json({ message: 'Table not found' });
        return;
      }

      // If table number is being updated, check for duplicates
      if (updates.table_number && updates.table_number !== table.table_number) {
        const existingTable = await this.tableRepository.findOne({
          where: { table_number: updates.table_number }
        });

        if (existingTable) {
          res.status(400).json({ message: 'Table number already exists' });
          return;
        }
      }
      
      // Debug: log incoming updates payload to help diagnose missing updates
      try { console.log('DEBUG updateTable payload:', JSON.stringify(updates)); } catch (e) { /* ignore */ }

      // Allow frontend to send `area` (semantic name) — map it to persisted `location` column
      if (Object.prototype.hasOwnProperty.call(updates, 'area') && !Object.prototype.hasOwnProperty.call(updates, 'location')) {
        updates.location = updates.area;
      }

      // Only persist allowed database columns to avoid TypeORM/DB errors
      // The `Table` entity only maps these persisted columns: table_number (number), capacity, status, location
  const allowedFields = ['table_number', 'capacity', 'status', 'location', 'location_description', 'notes'];
      const persistedUpdates: any = {};
      for (const key of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(updates, key)) {
          persistedUpdates[key] = updates[key];
        }
      }

      // Coerce types where appropriate
      if (persistedUpdates.capacity !== undefined) {
        persistedUpdates.capacity = Number(persistedUpdates.capacity);
      }

      if (Object.keys(persistedUpdates).length === 0) {
        // Nothing to update (client probably sent only virtual fields)
        res.status(400).json({ message: 'No valid fields to update' });
        return;
      }

      console.log('Updating table', id, 'with persisted fields:', persistedUpdates);

      await this.tableRepository.update(id, persistedUpdates);

      const updatedTable = await this.tableRepository.findOne({
        where: { id: id }
      });

      res.json({
        message: 'Table updated successfully',
        data: updatedTable
      });
    } catch (error) {
      console.error('Error updating table:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Delete table (soft delete)
  public deleteTable = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const table = await this.tableRepository.findOne({
        where: { id: id }
      });

      if (!table) {
        res.status(404).json({ message: 'Table not found' });
        return;
      }

      // Check if table is currently occupied or reserved
      if (table.status === TableStatus.OCCUPIED || table.status === TableStatus.RESERVED) {
        res.status(400).json({ 
          message: 'Cannot delete table that is currently occupied or reserved' 
        });
        return;
      }

      // Remove related QR codes first to avoid foreign key constraint violations
      try {
        await this.qrCodeRepository.delete({ table_id: id });
      } catch (qrDelErr) {
        console.error('Error deleting related QR codes (non-fatal):', qrDelErr);
      }

      // Hard delete since no is_active column
      await this.tableRepository.delete(id);

      res.json({ message: 'Table deleted successfully' });
    } catch (error) {
      console.error('Error deleting table:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Update table status
  public updateTableStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, guest_count, customer_name, customer_phone, notes } = req.body;

      const table = await this.tableRepository.findOne({
        where: { id: id }
      });

      if (!table) {
        res.status(404).json({ message: 'Table not found' });
        return;
      }

      // Only persist allowed database columns to avoid TypeORM errors
      // The `Table` entity only maps these persisted columns: table_number (number), capacity, status, location
      // We'll persist `status` only and handle non-persisted fields (usage history, timestamps) via separate operations.
      const persistedUpdate: any = { status };

      // Handle side-effects that do not directly write non-existent columns
      if (status === TableStatus.OCCUPIED) {
        // Create usage history record (non-fatal if table missing)
        try {
          const usageHistory = this.usageHistoryRepository.create({
            table_id: id,
            customer_name,
            customer_phone,
            guest_count: guest_count || 1,
            start_time: new Date(),
            usage_type: 'walk_in'
          });
          await this.usageHistoryRepository.save(usageHistory);
        } catch (historyErr) {
          console.error('Non-fatal: could not write usage history:', historyErr);
        }
      } else if (status === TableStatus.AVAILABLE) {
        // If changing from occupied to available, update usage history end_time
        if (table.status === TableStatus.OCCUPIED) {
          const endTime = new Date();
          const startTime = table.occupied_since;

          if (startTime) {
            try {
              const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 60000); // minutes

              const recentUsage = await this.usageHistoryRepository
                .createQueryBuilder('usage')
                .where('usage.table_id = :tableId', { tableId: id })
                .andWhere('usage.end_time IS NULL')
                .orderBy('usage.start_time', 'DESC')
                .getOne();

              if (recentUsage) {
                await this.usageHistoryRepository.update(recentUsage.usage_id, {
                  end_time: endTime,
                  duration_minutes: duration
                });
              }
            } catch (historyErr) {
              console.error('Non-fatal: could not update usage history:', historyErr);
            }
          }
        }
      } else if (status === TableStatus.CLEANING) {
        // record cleaning event in usage history or logs if needed (do not write virtual columns)
        // nothing to persist on table row besides status
      } else if (status === TableStatus.RESERVED) {
        // reservation handling (store in reservations table if available) - skip table columns
      }

      if (notes) {
        // Optionally log notes or store elsewhere; do not attempt to write virtual `notes` column
        console.log(`Status update notes for table ${id}:`, notes);
      }

      await this.tableRepository.update(id, persistedUpdate);

      const updatedTable = await this.tableRepository.findOne({
        where: { id: id }
      });

      res.json({
        message: 'Table status updated successfully',
        data: updatedTable
      });
    } catch (error) {
      // Log full error server-side for debugging, but return sanitized message to clients
      console.error('Error updating table status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Generate QR Code for table
  private generateQRCodeForTable = async (tableId: string): Promise<void> => {
    try {
      const table = await this.tableRepository.findOne({
        where: { id: tableId }
      });

      if (!table) return;

      // Create QR code value (could be a URL to the ordering system)
      const qrValue = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order/table/${table.table_number}?tableId=${tableId}`;
      
      // Generate QR code image as base64 (placeholder for now)
      const qrCodeImage = `data:image/svg+xml;base64,${Buffer.from(`<svg>QR Code for Table ${table.table_number}</svg>`).toString('base64')}`;

      // Check if QR code already exists
      let qrCode = await this.qrCodeRepository.findOne({
        where: { table_id: tableId }
      });

      if (qrCode) {
        // Update existing QR code
        await this.qrCodeRepository.update(qrCode.qr_id, {
          qr_code_value: qrValue,
          // is_active: true // Column doesn't exist
        });
      } else {
        // Create new QR code
        qrCode = this.qrCodeRepository.create({
          table_id: tableId,
          qr_code_value: qrValue,
          qr_type: 'table_ordering',
          // is_active: true, // Column doesn't exist
          additional_data: {
            qr_image: qrCodeImage,
            table_number: table.table_number
          }
        });
        await this.qrCodeRepository.save(qrCode);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  // Get QR code for table
  public getTableQRCode = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const qrCode = await this.qrCodeRepository.findOne({
        where: { table_id: id }
      });

      if (!qrCode) {
        // Generate QR code if it doesn't exist
        await this.generateQRCodeForTable(id);
        
        const newQRCode = await this.qrCodeRepository.findOne({
          where: { table_id: id }
        });

        if (!newQRCode) {
          res.status(404).json({ message: 'Could not generate QR code' });
          return;
        }

        res.json({
          message: 'QR code retrieved successfully',
          data: newQRCode
        });
        return;
      }

      res.json({
        message: 'QR code retrieved successfully',
        data: qrCode
      });
    } catch (error) {
      console.error('Error fetching QR code:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Get table usage history
  public getTableUsageHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { 
        start_date, 
        end_date, 
        page = 1, 
        limit = 20 
      } = req.query;

      const query = this.usageHistoryRepository.createQueryBuilder('usage')
        .where('usage.table_id = :tableId', { tableId: id });

      if (start_date) {
        query.andWhere('usage.start_time >= :start_date', { start_date });
      }
      if (end_date) {
        query.andWhere('usage.start_time <= :end_date', { end_date });
      }

      const offset = (Number(page) - 1) * Number(limit);
      query.skip(offset).take(Number(limit));
      query.orderBy('usage.start_time', 'DESC');

      const [history, total] = await query.getManyAndCount();

      res.json({
        message: 'Usage history retrieved successfully',
        data: history,
        pagination: {
          current_page: Number(page),
          per_page: Number(limit),
          total,
          total_pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching usage history:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Get table statistics
  public getTableStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const totalTables = await this.tableRepository.count({ 
        // where: { is_active: true } // Column doesn't exist
      });
      
      const availableTables = await this.tableRepository.count({ 
        where: { status: TableStatus.AVAILABLE } 
      });
      
      const occupiedTables = await this.tableRepository.count({ 
        where: { status: TableStatus.OCCUPIED } 
      });
      
      const reservedTables = await this.tableRepository.count({ 
        where: { status: TableStatus.RESERVED } 
      });

      const cleaningTables = await this.tableRepository.count({ 
        where: { status: TableStatus.CLEANING } 
      });

      // Area distribution
      const areaStats = await this.tableRepository
        .createQueryBuilder('table')
        .select('table.location', 'area')
        .addSelect('COUNT(*)', 'count')
        // .where('table.is_active = :is_active', { is_active: true }) // Column doesn't exist
        .groupBy('table.location')
        .getRawMany();

      // Capacity distribution
      const capacityStats = await this.tableRepository
        .createQueryBuilder('table')
        .select('table.capacity', 'capacity')
        .addSelect('COUNT(*)', 'count')
        // .where('table.is_active = :is_active', { is_active: true }) // Column doesn't exist
        .groupBy('table.capacity')
        .orderBy('table.capacity', 'ASC')
        .getRawMany();

      res.json({
        message: 'Table statistics retrieved successfully',
        data: {
          total: totalTables,
          available: availableTables,
          occupied: occupiedTables,
          reserved: reservedTables,
          cleaning: cleaningTables,
          out_of_order: totalTables - availableTables - occupiedTables - reservedTables - cleaningTables,
          by_area: areaStats,
          by_capacity: capacityStats
        }
      });
    } catch (error) {
      console.error('Error fetching table stats:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Get tables dashboard (overview)
  public getTablesDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      // Get all tables with current status
      const tables = await this.tableRepository.find({
        // where: { is_active: true }, // Column doesn't exist
        order: { table_number: 'ASC' }
      });

      // Get table statistics
      const stats = await this.getTableStatsData();

      // Get recent activity (last 10 table status changes)
      const recentActivity = await this.usageHistoryRepository.find({
        take: 10,
        order: { created_at: 'DESC' }
      });

      res.json({
        message: 'Tables dashboard data retrieved successfully',
        data: {
          tables,
          statistics: stats,
          recent_activity: recentActivity
        }
      });
    } catch (error) {
      console.error('Error fetching tables dashboard:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  private getTableStatsData = async () => {
    const totalTables = await this.tableRepository.count({ 
      // where: { is_active: true } // Column doesn't exist
    });
    
    const availableTables = await this.tableRepository.count({ 
      where: { status: TableStatus.AVAILABLE } 
    });
    
    const occupiedTables = await this.tableRepository.count({ 
      where: { status: TableStatus.OCCUPIED } 
    });
    
    const reservedTables = await this.tableRepository.count({ 
      where: { status: TableStatus.RESERVED } 
    });

    return {
      total: totalTables,
      available: availableTables,
      occupied: occupiedTables,
      reserved: reservedTables,
      utilization_rate: totalTables > 0 ? ((occupiedTables + reservedTables) / totalTables * 100).toFixed(1) : 0
    };
  };
}
