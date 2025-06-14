"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSerialNo = exports.validateModelNo = exports.deleteInventoryItem = exports.updateInventoryItem = exports.createInventoryItem = exports.getInventoryItems = void 0;
const database_1 = require("../config/database");
const getInventoryItems = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const category = req.query.category;
        const dept_area = req.query.dept_area;
        const status = req.query.status;
        const condition_status = req.query.condition_status;
        const sortBy = req.query.sortBy;
        const sortOrder = req.query.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        const conn = await database_1.connection;
        const whereConditions = [];
        const params = [];
        if (search) {
            whereConditions.push(`(
        sn_description LIKE ? OR 
        assignee LIKE ? OR 
        tag_id LIKE ?
      )`);
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (category) {
            whereConditions.push('category = ?');
            params.push(category);
        }
        if (dept_area) {
            whereConditions.push('dept_area = ?');
            params.push(dept_area);
        }
        if (status) {
            whereConditions.push('status = ?');
            params.push(status);
        }
        if (condition_status) {
            whereConditions.push('condition_status = ?');
            params.push(condition_status);
        }
        const whereClause = whereConditions.length > 0
            ? 'WHERE ' + whereConditions.join(' AND ')
            : '';
        const allowedSortFields = ['tag_id', 'sn_description', 'assignee', 'status', 'dept_area'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'id';
        const orderByClause = `ORDER BY ${sortField} ${sortOrder}`;
        const query = `
      SELECT * FROM inventory_items 
      ${whereClause}
      ${orderByClause}
      LIMIT ? OFFSET ?
    `;
        const [items] = await conn.execute(query, [...params, limit, offset]);
        const [countResult] = await conn.execute(`SELECT COUNT(*) as total FROM inventory_items ${whereClause}`, params);
        const total = countResult[0]?.total || 0;
        res.json({
            items,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getInventoryItems = getInventoryItems;
const createInventoryItem = async (req, res) => {
    try {
        const conn = await database_1.connection;
        const [lastItem] = await conn.execute('SELECT tag_id FROM inventory_items ORDER BY id DESC LIMIT 1');
        let newIdNumber = 1;
        if (lastItem && lastItem[0]?.tag_id) {
            const lastNumber = parseInt(lastItem[0].tag_id.replace('MLCA', '')) || 0;
            newIdNumber = lastNumber + 1;
        }
        const newMlcaId = `MLCA${newIdNumber.toString().padStart(4, '0')}`;
        const { sn_description, category, dept_area, office, designation, assignee, email_address, password, mobile_number, date_issued, supplier, warranty_expiration, status, condition_status, unit_value, qty, total_value, model_no, serial_no, remarks, chain_of_ownership, previous_owner, remarks_date } = req.body;
        const parsedUnitValue = Number(unit_value) || 0;
        const parsedQty = Number(qty) || 1;
        const parsedTotalValue = Number(total_value) || (parsedUnitValue * parsedQty);
        const formattedDateIssued = date_issued ? new Date(date_issued) : null;
        const formattedWarrantyExpiration = warranty_expiration ? new Date(warranty_expiration) : null;
        const formattedRemarksDate = remarks_date ? new Date(remarks_date) : new Date();
        const insertQuery = `
      INSERT INTO inventory_items (
        sn_description, tag_id, category, dept_area, office,
        designation, assignee, email_address, password, mobile_number,
        date_issued, supplier, warranty_expiration, status,
        condition_status, unit_value, qty, total_value,
        model_no, serial_no, remarks, chain_of_ownership,
        previous_owner, remarks_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        const values = [
            sn_description || null,
            newMlcaId,
            category || null,
            dept_area || null,
            office || null,
            designation || null,
            assignee || null,
            email_address || null,
            password || null,
            mobile_number || null,
            formattedDateIssued,
            supplier || null,
            formattedWarrantyExpiration,
            status || 'Active',
            condition_status || 'New',
            parsedUnitValue,
            parsedQty,
            parsedTotalValue,
            model_no || null,
            serial_no || null,
            remarks || null,
            chain_of_ownership || null,
            previous_owner || null,
            formattedRemarksDate
        ];
        console.log('Inserting with values:', values);
        const [result] = await conn.execute(insertQuery, values);
        res.status(201).json({
            message: 'Inventory item created successfully',
            item: {
                id: result.insertId,
                tag_id: newMlcaId,
                ...req.body,
                unit_value: parsedUnitValue,
                qty: parsedQty,
                total_value: parsedTotalValue
            }
        });
    }
    catch (error) {
        console.error('Error creating inventory item:', error);
        res.status(500).json({
            message: 'Failed to create inventory item',
            error: process.env.NODE_ENV === 'development' ?
                (error instanceof Error ? error.message : String(error)) :
                undefined
        });
    }
};
exports.createInventoryItem = createInventoryItem;
const updateInventoryItem = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ message: 'ID is required for updates' });
            return;
        }
        const conn = await database_1.connection;
        const [existing] = await conn.execute('SELECT id FROM inventory_items WHERE id = ?', [id]);
        if (!existing.length) {
            res.status(404).json({ message: 'Asset not found' });
            return;
        }
        const { sn_description, category, dept_area, office, designation, assignee, email_address, password, mobile_number, date_issued, supplier, warranty_expiration, status, condition_status, unit_value, qty, total_value, model_no, serial_no, remarks, chain_of_ownership, previous_owner, remarks_date } = req.body;
        const parsedUnitValue = typeof unit_value === 'string' ?
            parseFloat(unit_value.replace(/[₱,]/g, '')) :
            (typeof unit_value === 'number' ? unit_value : 0);
        const parsedQty = Number(qty) || 1;
        const parsedTotalValue = typeof total_value === 'string' ?
            parseFloat(total_value.replace(/[₱,]/g, '')) :
            (typeof total_value === 'number' ? total_value : parsedUnitValue * parsedQty);
        const values = [
            sn_description || null,
            category || null,
            dept_area || null,
            office || null,
            designation || null,
            assignee || null,
            email_address || null,
            password || null,
            mobile_number || null,
            date_issued ? new Date(date_issued) : null,
            supplier || null,
            warranty_expiration ? new Date(warranty_expiration) : null,
            status || null,
            condition_status || null,
            parsedUnitValue,
            parsedQty,
            parsedTotalValue,
            model_no || null,
            serial_no || null,
            remarks || null,
            chain_of_ownership || null,
            previous_owner || null,
            remarks_date || null,
            id
        ];
        await conn.execute(`UPDATE inventory_items SET
        sn_description = ?, category = ?, dept_area = ?, office = ?,
        designation = ?, assignee = ?, email_address = ?, password = ?,
        mobile_number = ?, date_issued = ?, supplier = ?, warranty_expiration = ?,
        status = ?, condition_status = ?, unit_value = ?, qty = ?,
        total_value = ?, model_no = ?, serial_no = ?, remarks = ?,
        chain_of_ownership = ?, previous_owner = ?, remarks_date = ?
      WHERE id = ?`, values);
        const [updated] = await conn.execute('SELECT * FROM inventory_items WHERE id = ?', [id]);
        res.json({
            message: 'Inventory item updated successfully',
            item: updated[0]
        });
    }
    catch (error) {
        console.error('Error updating inventory item:', error);
        res.status(500).json({ message: 'Failed to update inventory item' });
    }
};
exports.updateInventoryItem = updateInventoryItem;
const deleteInventoryItem = async (req, res) => {
    try {
        const { id } = req.params;
        const conn = await database_1.connection;
        await conn.execute('DELETE FROM inventory_items WHERE id = ?', [id]);
        res.json({ message: 'Inventory item deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting inventory item:', error);
        res.status(500).json({ message: 'Failed to delete inventory item' });
    }
};
exports.deleteInventoryItem = deleteInventoryItem;
const validateModelNo = async (req, res) => {
    try {
        const { modelNo } = req.params;
        const conn = await database_1.connection;
        const [rows] = await conn.execute('SELECT id FROM inventory_items WHERE model_no = ?', [modelNo]);
        res.json({ exists: rows.length > 0 });
    }
    catch (error) {
        console.error('Error validating model number:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.validateModelNo = validateModelNo;
const validateSerialNo = async (req, res) => {
    try {
        const { serialNo } = req.params;
        const conn = await database_1.connection;
        const [rows] = await conn.execute('SELECT id FROM inventory_items WHERE serial_no = ?', [serialNo]);
        res.json({ exists: rows.length > 0 });
    }
    catch (error) {
        console.error('Error validating serial number:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.validateSerialNo = validateSerialNo;
//# sourceMappingURL=inventory.controller.js.map