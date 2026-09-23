const InventoryItem = require('../models/InventoryItem');
const StockTransaction = require('../models/StockTransaction');
const Notification = require('../models/Notification');
const { logAudit } = require('../middleware/auditLogger');

// @desc    Get all inventory items with filter & search
// @route   GET /api/inventory
// @access  Private
exports.getInventory = async (req, res) => {
  try {
    const { search, category, stockStatus, sortBy, order } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { itemId: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') query.category = category;

    const sortField = sortBy || 'name';
    const sortOrder = order === 'desc' ? -1 : 1;

    let items = await InventoryItem.find(query).sort({ [sortField]: sortOrder });

    // Filter by virtual stockStatus if requested
    if (stockStatus && stockStatus !== 'All') {
      items = items.filter((item) => item.stockStatus === stockStatus);
    }

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory items',
      error: error.message,
    });
  }
};

// @desc    Get single inventory item by ID
// @route   GET /api/inventory/:id
// @access  Private
exports.getInventoryById = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    // Retrieve recent stock transactions for this item
    const transactions = await StockTransaction.find({ item: item._id }).sort({ date: -1 }).limit(20);

    res.status(200).json({
      success: true,
      data: {
        ...item.toObject(),
        transactions,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory item',
      error: error.message,
    });
  }
};

// @desc    Create new inventory item
// @route   POST /api/inventory
// @access  Private (Admin, Store In-Charge)
exports.createInventoryItem = async (req, res) => {
  try {
    let { itemId, quantity, name } = req.body;

    if (!itemId) {
      const count = await InventoryItem.countDocuments();
      itemId = `INV-${String(count + 1).padStart(4, '0')}`;
    }

    const existing = await InventoryItem.findOne({ itemId: itemId.toUpperCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Item with ID '${itemId}' already exists.`,
      });
    }

    const item = await InventoryItem.create({
      ...req.body,
      itemId: itemId.toUpperCase(),
    });

    // Record initial stock transaction if quantity > 0
    if (quantity > 0) {
      const countTxn = await StockTransaction.countDocuments();
      const transactionId = `TXN-${String(countTxn + 1).padStart(5, '0')}`;

      await StockTransaction.create({
        transactionId,
        item: item._id,
        itemName: item.name,
        itemCode: item.itemId,
        transactionType: 'Stock In',
        quantity,
        previousQuantity: 0,
        newQuantity: quantity,
        user: req.user._id,
        userName: req.user.name,
        reason: 'Initial inventory registration',
      });
    }

    await logAudit({
      user: req.user,
      req,
      action: 'CREATE_INVENTORY',
      module: 'Inventory',
      recordId: item.itemId,
      description: `Registered new inventory consumable ${item.name} (${item.itemId}) with initial qty ${item.quantity} ${item.unit}.`,
    });

    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating inventory item',
      error: error.message,
    });
  }
};

// @desc    Update inventory item details
// @route   PUT /api/inventory/:id
// @access  Private (Admin, Store In-Charge)
exports.updateInventoryItem = async (req, res) => {
  try {
    let item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    // Do not allow direct quantity overwrite through general edit — use stock change API
    const { quantity, ...updateFields } = req.body;

    item = await InventoryItem.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });

    await logAudit({
      user: req.user,
      req,
      action: 'UPDATE_INVENTORY',
      module: 'Inventory',
      recordId: item.itemId,
      description: `Updated metadata for inventory item ${item.name} (${item.itemId}).`,
    });

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating inventory item',
      error: error.message,
    });
  }
};

// @desc    Perform Stock In, Stock Out, or Stock Adjustment
// @route   POST /api/inventory/:id/stock-change
// @access  Private (Admin, Store In-Charge)
exports.stockChange = async (req, res) => {
  try {
    const { transactionType, quantity, reason } = req.body;
    const numQty = Number(quantity);

    if (!transactionType || isNaN(numQty) || numQty < 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid transaction type and quantity.',
      });
    }

    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    const previousQuantity = item.quantity;
    let newQuantity = previousQuantity;

    if (transactionType === 'Stock In' || transactionType === 'Return') {
      newQuantity = previousQuantity + numQty;
    } else if (transactionType === 'Stock Out' || transactionType === 'Issue') {
      if (previousQuantity < numQty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Current quantity is ${previousQuantity} ${item.unit}, cannot deduct ${numQty}.`,
        });
      }
      newQuantity = previousQuantity - numQty;
    } else if (transactionType === 'Adjustment') {
      newQuantity = numQty;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction type.',
      });
    }

    item.quantity = newQuantity;
    await item.save();

    // Create Stock Transaction record
    const countTxn = await StockTransaction.countDocuments();
    const transactionId = `TXN-${String(countTxn + 1).padStart(5, '0')}`;

    const transaction = await StockTransaction.create({
      transactionId,
      item: item._id,
      itemName: item.name,
      itemCode: item.itemId,
      transactionType,
      quantity: Math.abs(newQuantity - previousQuantity),
      previousQuantity,
      newQuantity,
      user: req.user._id,
      userName: req.user.name,
      reason: reason || `${transactionType} operation`,
    });

    // Generate notifications if low or out of stock
    if (newQuantity <= 0) {
      await Notification.create({
        title: 'Item Out of Stock',
        message: `Consumable item "${item.name}" (${item.itemId}) is now completely out of stock!`,
        type: 'out_of_stock',
        referenceId: item.itemId,
        referenceModel: 'InventoryItem',
        targetRoles: ['admin', 'store_incharge'],
      });
    } else if (newQuantity <= item.minStockLevel) {
      await Notification.create({
        title: 'Low Stock Alert',
        message: `Consumable item "${item.name}" (${item.itemId}) is low on stock (${newQuantity} ${item.unit} remaining; min threshold: ${item.minStockLevel}).`,
        type: 'low_stock',
        referenceId: item.itemId,
        referenceModel: 'InventoryItem',
        targetRoles: ['admin', 'store_incharge'],
      });
    }

    await logAudit({
      user: req.user,
      req,
      action: 'STOCK_TRANSACTION',
      module: 'Inventory',
      recordId: item.itemId,
      description: `${transactionType} for ${item.name} (${item.itemId}): ${previousQuantity} -> ${newQuantity} ${item.unit}. Reason: ${reason || 'N/A'}.`,
    });

    res.status(200).json({
      success: true,
      message: `Stock updated successfully via ${transactionType}.`,
      data: {
        item,
        transaction,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating stock',
      error: error.message,
    });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (Admin Only)
exports.deleteInventoryItem = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    await InventoryItem.findByIdAndDelete(req.params.id);

    await logAudit({
      user: req.user,
      req,
      action: 'DELETE_INVENTORY',
      module: 'Inventory',
      recordId: item.itemId,
      description: `Deleted inventory consumable ${item.name} (${item.itemId}).`,
    });

    res.status(200).json({
      success: true,
      message: 'Inventory item deleted successfully',
      data: { id: req.params.id, itemId: item.itemId },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting inventory item',
      error: error.message,
    });
  }
};
