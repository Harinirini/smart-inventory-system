const Asset = require('../models/Asset');
const InventoryItem = require('../models/InventoryItem');
const Maintenance = require('../models/Maintenance');
const IssueReturn = require('../models/IssueReturn');

// @desc    Ask AI Assistant questions about college assets and inventory
// @route   POST /api/ai/ask
// @access  Private
exports.askAssistant = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a question.',
      });
    }

    const q = question.toLowerCase().trim();

    // Gather live institutional context from MongoDB
    const [assets, inventory, maintenance, issues] = await Promise.all([
      Asset.find(),
      InventoryItem.find(),
      Maintenance.find().sort({ scheduledDate: -1 }),
      IssueReturn.find().sort({ createdAt: -1 }),
    ]);

    const underMaintenanceAssets = assets.filter((a) => a.status === 'Under Maintenance');
    const availableAssets = assets.filter((a) => a.status === 'Available');
    const issuedAssets = assets.filter((a) => a.status === 'Issued');
    const lowStockItems = inventory.filter((i) => i.quantity <= i.minStockLevel);
    const outOfStockItems = inventory.filter((i) => i.quantity <= 0);

    // Group assets by laboratory
    const labCounts = {};
    assets.forEach((a) => {
      const lab = a.laboratory || 'General';
      labCounts[lab] = (labCounts[lab] || 0) + 1;
    });

    const highestLab = Object.entries(labCounts).sort((a, b) => b[1] - a[1])[0] || ['None', 0];

    // Check if Gemini API key exists in environment
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenAI } = require('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const systemContext = `
You are the AI Asset Assistant for an institutional laboratory management system.
Current real-time database state:
- Total assets: ${assets.length}
- Available assets: ${availableAssets.length}
- Issued assets: ${issuedAssets.length}
- Assets under maintenance (${underMaintenanceAssets.length}): ${underMaintenanceAssets.map((a) => `${a.name} [${a.assetId}] in ${a.laboratory}`).join(', ') || 'None'}
- Low stock items (${lowStockItems.length}): ${lowStockItems.map((i) => `${i.name} [${i.quantity} ${i.unit} left, min: ${i.minStockLevel}]`).join(', ') || 'None'}
- Out of stock items (${outOfStockItems.length}): ${outOfStockItems.map((i) => `${i.name} [${i.itemId}]`).join(', ') || 'None'}
- Lab with highest assets: ${highestLab[0]} (${highestLab[1]} assets)
- Active checkouts: ${issues.filter((i) => i.status === 'Issued').length}

Answer the user's inquiry concisely, professionally, and accurately using this institutional data.
`;

        const response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: `${systemContext}\n\nUser Question: ${question}`,
        });

        return res.status(200).json({
          success: true,
          mode: 'gemini',
          answer: response.text,
        });
      } catch (geminiErr) {
        console.warn('Gemini API call skipped/fallback:', geminiErr.message);
      }
    }

    // Built-in intelligent data-grounded assistant
    let answer = '';

    if (q.includes('maintenance') || q.includes('servicing') || q.includes('repair')) {
      if (underMaintenanceAssets.length === 0) {
        answer = 'Currently, there are **no assets under maintenance**. All assets are either available or checked out.';
      } else {
        const list = underMaintenanceAssets
          .map((a) => `• **${a.name}** (\`${a.assetId}\`) - ${a.department} / ${a.laboratory} (Condition: ${a.condition})`)
          .join('\n');
        answer = `There are currently **${underMaintenanceAssets.length} asset(s)** under maintenance:\n\n${list}\n\nYou can track ongoing service progress on the Maintenance page.`;
      }
    } else if (q.includes('low stock') || q.includes('shortage') || q.includes('order') || q.includes('out of stock')) {
      if (lowStockItems.length === 0 && outOfStockItems.length === 0) {
        answer = 'All inventory consumables are currently stocked above their minimum thresholds.';
      } else {
        let msg = '';
        if (outOfStockItems.length > 0) {
          msg += `🔴 **Out of Stock Items (${outOfStockItems.length})**:\n` +
            outOfStockItems.map((i) => `• **${i.name}** (\`${i.itemId}\`) - 0 ${i.unit} (Store: ${i.location})`).join('\n') + '\n\n';
        }
        if (lowStockItems.length > 0) {
          msg += `⚠️ **Low Stock Items (${lowStockItems.length})**:\n` +
            lowStockItems.map((i) => `• **${i.name}** (\`${i.itemId}\`) - ${i.quantity} ${i.unit} remaining (Min: ${i.minStockLevel})`).join('\n');
        }
        answer = msg;
      }
    } else if (q.includes('highest') || q.includes('most') || q.includes('which lab') || q.includes('laboratory')) {
      const sortedLabs = Object.entries(labCounts).sort((a, b) => b[1] - a[1]);
      const labList = sortedLabs.map(([lab, count]) => `• **${lab}**: ${count} asset(s)`).join('\n');
      answer = `The laboratory with the highest number of assets is **${highestLab[0]}** with **${highestLab[1]} assets**.\n\n**Laboratory Breakdown:**\n${labList}`;
    } else if (q.includes('overdue') || q.includes('return') || q.includes('issue') || q.includes('checkout')) {
      const now = new Date();
      const overdue = issues.filter((i) => i.status === 'Issued' && now > new Date(i.expectedReturnDate));
      if (overdue.length === 0) {
        answer = `There are **${issuedAssets.length} active asset checkouts**, and **0 are currently overdue**.`;
      } else {
        const list = overdue
          .map((i) => `• **${i.assetName}** (\`${i.assetId}\`) issued to **${i.issuedTo.name}** (${i.issuedTo.identifier}) - Expected: ${new Date(i.expectedReturnDate).toLocaleDateString()}`)
          .join('\n');
        answer = `There are **${overdue.length} overdue asset return(s)** requiring immediate attention:\n\n${list}`;
      }
    } else if (q.includes('total') || q.includes('summary') || q.includes('overview') || q.includes('status')) {
      answer = `### Institutional Asset & Inventory Overview:\n\n` +
        `• **Total Assets**: ${assets.length} items across ${Object.keys(labCounts).length} laboratories\n` +
        `• **Available**: ${availableAssets.length} ready for use\n` +
        `• **Currently Issued**: ${issuedAssets.length}\n` +
        `• **Under Maintenance**: ${underMaintenanceAssets.length}\n` +
        `• **Consumable Inventory**: ${inventory.length} distinct items (${lowStockItems.length} low stock)\n` +
        `• **Active Maintenance Tasks**: ${maintenance.filter((m) => m.status === 'Scheduled' || m.status === 'In Progress').length}`;
    } else {
      answer = `I analyzed your query based on real-time database records.\n\n` +
        `• Currently tracking **${assets.length} institutional assets** across **${Object.keys(labCounts).length} laboratories**.\n` +
        `• **${availableAssets.length}** are Available, **${issuedAssets.length}** Issued, and **${underMaintenanceAssets.length}** Under Maintenance.\n` +
        `• Consumables: **${inventory.length}** total items with **${lowStockItems.length}** flagged for re-ordering.\n\n` +
        `Feel free to ask: *"Which assets are under maintenance?"*, *"Show low stock consumables"*, or *"Which lab has the most equipment?"*`;
    }

    res.status(200).json({
      success: true,
      mode: 'grounded-engine',
      answer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing assistant query',
      error: error.message,
    });
  }
};
