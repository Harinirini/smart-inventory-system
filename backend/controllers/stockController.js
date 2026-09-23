const StockTransaction = require('../models/StockTransaction');

// @desc    Get all stock transactions with filters
// @route   GET /api/stock-transactions
// @access  Private
exports.getStockTransactions = async (req, res) => {
  try {
    const { transactionType, search, startDate, endDate } = req.query;

    let query = {};

    if (transactionType && transactionType !== 'All') {
      query.transactionType = transactionType;
    }

    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { itemCode: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const transactions = await StockTransaction.find(query).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving stock transactions',
      error: error.message,
    });
  }
};
