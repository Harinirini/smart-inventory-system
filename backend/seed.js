require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Asset = require('./models/Asset');
const InventoryItem = require('./models/InventoryItem');
const StockTransaction = require('./models/StockTransaction');
const IssueReturn = require('./models/IssueReturn');
const Maintenance = require('./models/Maintenance');
const Notification = require('./models/Notification');
const AuditLog = require('./models/AuditLog');
const { generateAssetQRCode } = require('./utils/qrGenerator');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_inventory';
    await mongoose.connect(mongoUri);
    console.log(`[Seed Script]: Connected to MongoDB at ${mongoUri}`);

    // Clear existing data
    console.log('[Seed Script]: Purging existing database collections...');
    await Promise.all([
      User.deleteMany({}),
      Asset.deleteMany({}),
      InventoryItem.deleteMany({}),
      StockTransaction.deleteMany({}),
      IssueReturn.deleteMany({}),
      Maintenance.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    // 1. Seed Users
    console.log('[Seed Script]: Creating default demo users...');
    const users = await User.create([
      {
        name: 'Dr. Rajesh Sharma',
        email: 'admin@college.edu',
        password: 'Admin@123',
        role: 'admin',
        department: 'Central IT & Administration',
        phone: '+91 98765 43210',
        status: 'active',
      },
      {
        name: 'Priya Verma',
        email: 'staff@college.edu',
        password: 'Staff@123',
        role: 'lab_staff',
        department: 'Electronics & Communication',
        phone: '+91 98765 43211',
        status: 'active',
      },
      {
        name: 'Anand Patel',
        email: 'store@college.edu',
        password: 'Store@123',
        role: 'store_incharge',
        department: 'Central Store & Inventory',
        phone: '+91 98765 43212',
        status: 'active',
      },
    ]);

    const [adminUser, staffUser, storeUser] = users;

    // 2. Seed Assets with generated QR codes
    console.log('[Seed Script]: Generating realistic institutional laboratory assets and QR codes...');
    const rawAssets = [
      {
        assetId: 'AST-1001',
        name: 'Dell OptiPlex 7090 Tower Workstation',
        category: 'Computing',
        description: 'Intel Core i7 11th Gen, 32GB RAM, 1TB NVMe SSD, NVIDIA GTX 1660 Super GPU for AI model training.',
        department: 'Computer Science',
        laboratory: 'AI & Machine Learning Lab',
        location: 'Room 301, Tech Block',
        brand: 'Dell',
        model: 'OptiPlex 7090',
        serialNumber: 'DL-OPT-99214',
        purchaseDate: new Date('2024-03-15'),
        purchaseCost: 82000,
        supplier: 'Dell India Direct Enterprise',
        warrantyExpiry: new Date('2027-03-15'),
        condition: 'Excellent',
        status: 'Available',
      },
      {
        assetId: 'AST-1002',
        name: 'Tektronix TBS1052B Digital Storage Oscilloscope',
        category: 'Measuring Instruments',
        description: '50 MHz, 2 Channels, 1 GS/s sampling rate, 7-inch WVGA color display with waveform FFT.',
        department: 'Electronics & Communication',
        laboratory: 'Microprocessor & Embedded Lab',
        location: 'Room 204, Circuit Block',
        brand: 'Tektronix',
        model: 'TBS1052B',
        serialNumber: 'TK-OSC-44120',
        purchaseDate: new Date('2023-08-10'),
        purchaseCost: 48000,
        supplier: 'TechLab Test Systems Pvt Ltd',
        warrantyExpiry: new Date('2026-08-10'),
        condition: 'Good',
        status: 'Available',
      },
      {
        assetId: 'AST-1003',
        name: 'Rigol DG1022Z Function / Arbitrary Waveform Generator',
        category: 'Measuring Instruments',
        description: '25 MHz maximum frequency, 2 channels, SiFi technology for 100% waveform reproduction.',
        department: 'Electronics & Communication',
        laboratory: 'VLSI & Signals Lab',
        location: 'Room 206, Circuit Block',
        brand: 'Rigol',
        model: 'DG1022Z',
        serialNumber: 'RG-GEN-88319',
        purchaseDate: new Date('2023-11-05'),
        purchaseCost: 36500,
        supplier: 'Apex Instruments',
        warrantyExpiry: new Date('2026-11-05'),
        condition: 'Good',
        status: 'Available',
      },
      {
        assetId: 'AST-1004',
        name: 'Creality Ender 3 V2 3D Printer',
        category: 'Laboratory Equipment',
        description: 'FDM Rapid Prototyping printer with carborundum glass platform and silent stepper drivers.',
        department: 'Mechanical Engineering',
        laboratory: 'Advanced Prototyping & CAD Lab',
        location: 'Room 102, Workshop Complex',
        brand: 'Creality',
        model: 'Ender 3 V2',
        serialNumber: 'CR-3DP-10492',
        purchaseDate: new Date('2023-01-20'),
        purchaseCost: 32000,
        supplier: '3D Hub Solutions',
        warrantyExpiry: new Date('2025-01-20'),
        condition: 'Fair',
        status: 'Under Maintenance',
      },
      {
        assetId: 'AST-1005',
        name: 'Epson EB-FH52 Full HD Wireless Projector',
        category: 'Audio-Visual',
        description: '4,000 lumens white/color brightness, 1080p Full HD resolution, Miracast projection.',
        department: 'Information Technology',
        laboratory: 'Multimedia Seminar Hall',
        location: 'Seminar Hall 1, Main Campus',
        brand: 'Epson',
        model: 'EB-FH52',
        serialNumber: 'EP-PRJ-22018',
        purchaseDate: new Date('2024-01-10'),
        purchaseCost: 64000,
        supplier: 'VisualTech Display Systems',
        warrantyExpiry: new Date('2027-01-10'),
        condition: 'Good',
        status: 'Available',
      },
      {
        assetId: 'AST-1006',
        name: 'Fluke 179 True-RMS Digital Multimeter',
        category: 'Measuring Instruments',
        description: 'Industrial multimeter with built-in temperature measurement and backlight display.',
        department: 'Electrical Engineering',
        laboratory: 'Power Electronics Lab',
        location: 'Room 210, Circuit Block',
        brand: 'Fluke',
        model: 'Fluke 179',
        serialNumber: 'FL-MM-77215',
        purchaseDate: new Date('2023-06-18'),
        purchaseCost: 26000,
        supplier: 'Scientific Meters Corp',
        warrantyExpiry: new Date('2026-06-18'),
        condition: 'Good',
        status: 'Issued',
        assignedTo: 'Arjun Mehta (Roll: 21EC042)',
      },
      {
        assetId: 'AST-1007',
        name: 'Keysight E3631A Triple Output DC Power Supply',
        category: 'Power & Electrical',
        description: '80W triple output (6V, 5A & ±25V, 1A) clean, low-noise power for circuit bench testing.',
        department: 'Electronics & Communication',
        laboratory: 'Microprocessor & Embedded Lab',
        location: 'Room 204, Circuit Block',
        brand: 'Keysight Technologies',
        model: 'E3631A',
        serialNumber: 'KS-PS-66104',
        purchaseDate: new Date('2022-09-12'),
        purchaseCost: 89000,
        supplier: 'Global Electronic Test Aids',
        warrantyExpiry: new Date('2025-09-12'),
        condition: 'Good',
        status: 'Available',
      },
      {
        assetId: 'AST-1008',
        name: 'Olympus CX23 Trinocular Biological Microscope',
        category: 'Laboratory Equipment',
        description: 'LED illumination, plan achromat optics 4x, 10x, 40x, 100x oil immersion objectives.',
        department: 'Biotechnology',
        laboratory: 'Microbiology & Genetics Lab',
        location: 'Room 405, Life Sciences Wing',
        brand: 'Olympus',
        model: 'CX23',
        serialNumber: 'OL-MIC-33190',
        purchaseDate: new Date('2023-04-25'),
        purchaseCost: 72000,
        supplier: 'BioMed Laboratory Supplies',
        warrantyExpiry: new Date('2026-04-25'),
        condition: 'Excellent',
        status: 'Available',
      },
      {
        assetId: 'AST-1009',
        name: 'APC Smart-UPS RT 5000VA On-Line Power Backup',
        category: 'Power & Electrical',
        description: 'High density, double-conversion on-line power protection with expandable runtime.',
        department: 'Computer Science',
        laboratory: 'Central Server Room',
        location: 'Room 305, Tech Block',
        brand: 'APC Schneider',
        model: 'SURT5000XLI',
        serialNumber: 'AP-UPS-91022',
        purchaseDate: new Date('2022-02-14'),
        purchaseCost: 155000,
        supplier: 'Schneider Electric Partner',
        warrantyExpiry: new Date('2025-02-14'),
        condition: 'Good',
        status: 'Available',
      },
      {
        assetId: 'AST-1010',
        name: 'Shimadzu UV-1900i UV-VIS Double Beam Spectrophotometer',
        category: 'Measuring Instruments',
        description: 'Ultra-fast scan rate of 29,000 nm/min, compliance with pharmacopeia standards.',
        department: 'Chemistry',
        laboratory: 'Instrumental Chemical Analysis Lab',
        location: 'Room 401, Chemical Sciences Block',
        brand: 'Shimadzu',
        model: 'UV-1900i',
        serialNumber: 'SH-SPEC-11025',
        purchaseDate: new Date('2023-10-30'),
        purchaseCost: 340000,
        supplier: 'Shimadzu Analytical India',
        warrantyExpiry: new Date('2026-10-30'),
        condition: 'Excellent',
        status: 'Available',
      },
      {
        assetId: 'AST-1011',
        name: 'HP LaserJet Pro MFP 4104dw Network Printer',
        category: 'Peripherals',
        description: 'High-volume duplex monochrome multifunction printer for department exam and records.',
        department: 'Computer Science',
        laboratory: 'Faculty & Research Room',
        location: 'Room 303, Tech Block',
        brand: 'HP',
        model: 'MFP 4104dw',
        serialNumber: 'HP-PRT-55127',
        purchaseDate: new Date('2023-05-11'),
        purchaseCost: 44000,
        supplier: 'OfficeNet Systems',
        warrantyExpiry: new Date('2024-05-11'),
        condition: 'Poor',
        status: 'Damaged',
      },
      {
        assetId: 'AST-1012',
        name: 'National Instruments myRIO-1900 Embedded Device',
        category: 'Laboratory Equipment',
        description: 'Dual-core ARM Cortex-A9 real-time processor and Xilinx FPGA for robotics & control labs.',
        department: 'Electronics & Communication',
        laboratory: 'Robotics & IoT Lab',
        location: 'Room 208, Circuit Block',
        brand: 'National Instruments',
        model: 'myRIO-1900',
        serialNumber: 'NI-RIO-66129',
        purchaseDate: new Date('2024-02-01'),
        purchaseCost: 58000,
        supplier: 'NI Systems India Pvt Ltd',
        warrantyExpiry: new Date('2027-02-01'),
        condition: 'Good',
        status: 'Issued',
        assignedTo: 'Sneha Roy (Roll: 21CS088)',
      },
    ];

    // Generate QR codes for all assets
    const createdAssets = [];
    for (const raw of rawAssets) {
      const qrCode = await generateAssetQRCode(raw);
      const asset = await Asset.create({ ...raw, qrCode });
      createdAssets.push(asset);
    }

    // 3. Seed Consumable Inventory Items
    console.log('[Seed Script]: Creating consumable inventory items...');
    const inventoryItems = await InventoryItem.create([
      {
        itemId: 'INV-2001',
        name: 'High-Speed HDMI 2.0 Cable (3 Meter)',
        category: 'Cables & Adapters',
        description: 'Gold-plated connectors, 4K 60Hz HDR compatible cable for lab monitors and projectors.',
        quantity: 4,
        minStockLevel: 10,
        unit: 'pcs',
        unitCost: 380,
        supplier: 'NexStore Electronics',
        location: 'Store Rack A1',
      },
      {
        itemId: 'INV-2002',
        name: 'CAT6 UTP Snagless Ethernet Patch Cable (2 Meter)',
        category: 'Cables & Adapters',
        description: 'Molded boot 550 MHz twisted pair patch cord for laboratory PC workstations.',
        quantity: 48,
        minStockLevel: 15,
        unit: 'pcs',
        unitCost: 190,
        supplier: 'D-Link Authorized Channel',
        location: 'Store Rack A2',
      },
      {
        itemId: 'INV-2003',
        name: '9V Heavy Duty Alkaline Battery (6LR61)',
        category: 'Electronic Components',
        description: 'Transistor battery used for handheld multimeters and portable sensor nodes.',
        quantity: 0,
        minStockLevel: 12,
        unit: 'pcs',
        unitCost: 95,
        supplier: 'Duracell Industrial Supplies',
        location: 'Store Drawer C1',
      },
      {
        itemId: 'INV-2004',
        name: 'MB-102 Solderless Breadboard 830 Tie-Points',
        category: 'Electronic Components',
        description: 'Standard transparent prototype breadboard with dual power rails.',
        quantity: 36,
        minStockLevel: 10,
        unit: 'pcs',
        unitCost: 165,
        supplier: 'RoboElements Co',
        location: 'Store Drawer C2',
      },
      {
        itemId: 'INV-2005',
        name: 'Arduino Uno R3 Microcontroller Board (Atmega328P)',
        category: 'Electronic Components',
        description: 'Standard educational microcontroller board with USB-B interface cable.',
        quantity: 5,
        minStockLevel: 8,
        unit: 'pcs',
        unitCost: 680,
        supplier: 'RoboElements Co',
        location: 'Store Cabinet B1',
      },
      {
        itemId: 'INV-2006',
        name: 'Lead-Free Solder Wire Spool (60/40, 500g)',
        category: 'Tools & Consumables',
        description: '0.8mm diameter rosin core soldering flux spool.',
        quantity: 14,
        minStockLevel: 5,
        unit: 'rolls',
        unitCost: 1350,
        supplier: 'Apex Tools Ltd',
        location: 'Store Shelf D3',
      },
      {
        itemId: 'INV-2007',
        name: 'Logitech MK270 Wireless Keyboard & Mouse Combo',
        category: 'Peripherals',
        description: '2.4 GHz USB unifying receiver keyboard and mouse for student programming stations.',
        quantity: 2,
        minStockLevel: 5,
        unit: 'sets',
        unitCost: 1850,
        supplier: 'OfficeNet Systems',
        location: 'Store Rack E1',
      },
      {
        itemId: 'INV-2008',
        name: 'Metal Film Resistor Assortment Kit (1/4W, 1000 Pcs)',
        category: 'Electronic Components',
        description: 'Values ranging from 10 Ohm to 1 MOhm in organized multi-compartment box.',
        quantity: 22,
        minStockLevel: 6,
        unit: 'packs',
        unitCost: 450,
        supplier: 'Semicon Hub',
        location: 'Store Drawer C3',
      },
      {
        itemId: 'INV-2009',
        name: 'Fast-Blow Glass Cartridge Fuses 5x20mm 2A (Pack of 10)',
        category: 'Electronic Components',
        description: 'Replacement fuses for bench power supplies and function generators.',
        quantity: 0,
        minStockLevel: 6,
        unit: 'packs',
        unitCost: 120,
        supplier: 'Scientific Meters Corp',
        location: 'Store Drawer C4',
      },
      {
        itemId: 'INV-2010',
        name: 'JK Copier A4 Paper 75 GSM (Ream of 500 Sheets)',
        category: 'Stationery',
        description: 'High opacity printing paper for lab manuals, worksheets, and reports.',
        quantity: 30,
        minStockLevel: 10,
        unit: 'reams',
        unitCost: 330,
        supplier: 'Central Stationers',
        location: 'Store Rack F2',
      },
    ]);

    // 4. Seed Stock Transactions
    console.log('[Seed Script]: Creating stock transaction audit entries...');
    await StockTransaction.create([
      {
        transactionId: 'TXN-00001',
        item: inventoryItems[0]._id,
        itemName: inventoryItems[0].name,
        itemCode: inventoryItems[0].itemId,
        transactionType: 'Stock In',
        quantity: 20,
        previousQuantity: 0,
        newQuantity: 20,
        user: storeUser._id,
        userName: storeUser.name,
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        reason: 'Semester opening stock replenishment purchase order #PO-2024-88',
      },
      {
        transactionId: 'TXN-00002',
        item: inventoryItems[0]._id,
        itemName: inventoryItems[0].name,
        itemCode: inventoryItems[0].itemId,
        transactionType: 'Stock Out',
        quantity: 16,
        previousQuantity: 20,
        newQuantity: 4,
        user: storeUser._id,
        userName: storeUser.name,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        reason: 'Issued to Electronics Lab B for student setup',
      },
      {
        transactionId: 'TXN-00003',
        item: inventoryItems[2]._id,
        itemName: inventoryItems[2].name,
        itemCode: inventoryItems[2].itemId,
        transactionType: 'Stock Out',
        quantity: 12,
        previousQuantity: 12,
        newQuantity: 0,
        user: storeUser._id,
        userName: storeUser.name,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        reason: 'Depleted during final year robotics project evaluations',
      },
      {
        transactionId: 'TXN-00004',
        item: inventoryItems[6]._id,
        itemName: inventoryItems[6].name,
        itemCode: inventoryItems[6].itemId,
        transactionType: 'Stock Out',
        quantity: 8,
        previousQuantity: 10,
        newQuantity: 2,
        user: storeUser._id,
        userName: storeUser.name,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        reason: 'Replacement for broken lab peripherals in Room 301',
      },
    ]);

    // 5. Seed Issue / Return records (Including 1 Overdue record!)
    console.log('[Seed Script]: Creating asset checkout and return history...');
    const astFluke = createdAssets.find((a) => a.assetId === 'AST-1006');
    const astMyRIO = createdAssets.find((a) => a.assetId === 'AST-1012');
    const astRigol = createdAssets.find((a) => a.assetId === 'AST-1003');

    // Overdue record: expected return date 5 days ago!
    const overdueIssueDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const overdueExpectedDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

    await IssueReturn.create([
      {
        asset: astFluke._id,
        assetId: astFluke.assetId,
        assetName: astFluke.name,
        issuedTo: {
          name: 'Arjun Mehta',
          identifier: '21EC042',
          department: 'Electronics & Communication',
          email: 'arjun.mehta@student.college.edu',
          phone: '+91 98111 22334',
        },
        issueDate: overdueIssueDate,
        expectedReturnDate: overdueExpectedDate,
        issuedBy: staffUser._id,
        issuedByName: staffUser.name,
        status: 'Issued',
        remarks: 'Issued for Power Inverter Capstone Project benchmarking.',
      },
      {
        asset: astMyRIO._id,
        assetId: astMyRIO.assetId,
        assetName: astMyRIO.name,
        issuedTo: {
          name: 'Sneha Roy',
          identifier: '21CS088',
          department: 'Computer Science',
          email: 'sneha.roy@student.college.edu',
          phone: '+91 98222 33445',
        },
        issueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        expectedReturnDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        issuedBy: staffUser._id,
        issuedByName: staffUser.name,
        status: 'Issued',
        remarks: 'Embedded systems RTOS implementation lab assignment.',
      },
      {
        asset: astRigol._id,
        assetId: astRigol.assetId,
        assetName: astRigol.name,
        issuedTo: {
          name: 'Prof. Vikram Nair',
          identifier: 'FAC-ECE-104',
          department: 'Electronics & Communication',
          email: 'vikram.nair@college.edu',
          phone: '+91 98333 44556',
        },
        issueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        expectedReturnDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        issuedBy: staffUser._id,
        issuedByName: staffUser.name,
        returnDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
        returnedBy: staffUser._id,
        returnedByName: staffUser.name,
        conditionAfterReturn: 'Good',
        status: 'Returned',
        remarks: 'Used for signals and systems laboratory demonstration.',
      },
    ]);

    // 6. Seed Maintenance Records
    console.log('[Seed Script]: Creating maintenance records...');
    const astOsc = createdAssets.find((a) => a.assetId === 'AST-1002');
    const ast3DP = createdAssets.find((a) => a.assetId === 'AST-1004');
    const astUPS = createdAssets.find((a) => a.assetId === 'AST-1009');

    await Maintenance.create([
      {
        maintenanceId: 'MNT-0001',
        asset: ast3DP._id,
        assetId: ast3DP.assetId,
        assetName: ast3DP.name,
        maintenanceType: 'Repair',
        scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        technician: 'In-House Workshop Technician',
        description: 'Hotend clogging and nozzle thermal runaway inspection; bed levelling realignment.',
        cost: 1200,
        status: 'In Progress',
        remarks: 'Awaiting replacement 0.4mm brass nozzles and thermistor.',
        createdBy: staffUser._id,
      },
      {
        maintenanceId: 'MNT-0002',
        asset: astOsc._id,
        assetId: astOsc.assetId,
        assetName: astOsc.name,
        maintenanceType: 'Preventive',
        scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        technician: 'Tektronix India Certified Calibration',
        description: 'Periodic bi-annual voltage reference calibration and probe attenuation verification.',
        cost: 3500,
        status: 'Scheduled',
        remarks: 'Scheduled during upcoming semester mid-term break.',
        createdBy: adminUser._id,
      },
      {
        maintenanceId: 'MNT-0003',
        asset: astUPS._id,
        assetId: astUPS.assetId,
        assetName: astUPS.name,
        maintenanceType: 'Corrective',
        scheduledDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        completedDate: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000),
        technician: 'Schneider Electric Field Engineer',
        description: 'Replaced degraded 12V 9Ah VRLA internal battery module string #2.',
        cost: 18500,
        status: 'Completed',
        remarks: 'Load test passed with 45 minutes runtime at 75% server load.',
        createdBy: adminUser._id,
      },
    ]);

    // 7. Seed Notifications
    console.log('[Seed Script]: Creating initial alert notifications...');
    await Notification.create([
      {
        title: 'Overdue Asset Return Warning',
        message: `Asset "${astFluke.name}" (${astFluke.assetId}) issued to Arjun Mehta (21EC042) was due for return on ${overdueExpectedDate.toLocaleDateString()} and is now overdue!`,
        type: 'overdue',
        referenceId: astFluke.assetId,
        referenceModel: 'Asset',
        isRead: false,
        targetRoles: ['admin', 'lab_staff'],
      },
      {
        title: 'Out of Stock Alert: 9V Batteries',
        message: 'Consumable item "9V Heavy Duty Alkaline Battery" (INV-2003) is completely depleted (0 pcs remaining).',
        type: 'out_of_stock',
        referenceId: 'INV-2003',
        referenceModel: 'InventoryItem',
        isRead: false,
        targetRoles: ['admin', 'store_incharge'],
      },
      {
        title: 'Low Stock Alert: HDMI Cables',
        message: 'Consumable item "High-Speed HDMI 2.0 Cable" (INV-2001) has reached low stock threshold (4 pcs left; min threshold: 10).',
        type: 'low_stock',
        referenceId: 'INV-2001',
        referenceModel: 'InventoryItem',
        isRead: false,
        targetRoles: ['admin', 'store_incharge'],
      },
      {
        title: 'Upcoming Scheduled Maintenance',
        message: `Preventive calibration for "${astOsc.name}" (${astOsc.assetId}) is scheduled in 5 days.`,
        type: 'maintenance',
        referenceId: 'MNT-0002',
        referenceModel: 'Maintenance',
        isRead: false,
        targetRoles: ['admin', 'lab_staff'],
      },
    ]);

    // 8. Seed Audit Logs
    console.log('[Seed Script]: Generating initial audit trail logs...');
    await AuditLog.create([
      {
        user: adminUser._id,
        userName: adminUser.name,
        userRole: adminUser.role,
        action: 'SYSTEM_INIT',
        module: 'System',
        description: 'Initialized Smart Inventory and Asset Management System database schema.',
        ipAddress: '127.0.0.1',
      },
      {
        user: adminUser._id,
        userName: adminUser.name,
        userRole: adminUser.role,
        action: 'CREATE_ASSET',
        module: 'Asset',
        recordId: 'AST-1001',
        description: 'Registered new asset: Dell OptiPlex 7090 Tower Workstation (AST-1001) in AI Lab.',
        ipAddress: '192.168.1.10',
      },
      {
        user: storeUser._id,
        userName: storeUser.name,
        userRole: storeUser.role,
        action: 'STOCK_TRANSACTION',
        module: 'Inventory',
        recordId: 'INV-2001',
        description: 'Stock Out for High-Speed HDMI Cable (INV-2001): 20 -> 4 pcs. Dispatched to Lab B.',
        ipAddress: '192.168.1.45',
      },
      {
        user: staffUser._id,
        userName: staffUser.name,
        userRole: staffUser.role,
        action: 'ISSUE_ASSET',
        module: 'IssueReturn',
        recordId: 'AST-1006',
        description: 'Issued Fluke 179 True-RMS Multimeter (AST-1006) to Arjun Mehta (21EC042).',
        ipAddress: '192.168.1.33',
      },
      {
        user: staffUser._id,
        userName: staffUser.name,
        userRole: staffUser.role,
        action: 'SCHEDULE_MAINTENANCE',
        module: 'Maintenance',
        recordId: 'MNT-0001',
        description: 'Scheduled Repair for Creality Ender 3 V2 (AST-1004). Status: In Progress.',
        ipAddress: '192.168.1.33',
      },
    ]);

    console.log('\n======================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Demo Accounts Created:');
    console.log('1. Administrator:   admin@college.edu / Admin@123');
    console.log('2. Lab Staff:       staff@college.edu / Staff@123');
    console.log('3. Store In-Charge: store@college.edu / Store@123');
    console.log('======================================================');
    console.log(`Assets:           ${createdAssets.length}`);
    console.log(`Inventory Items:  ${inventoryItems.length}`);
    console.log(`Transactions:     4`);
    console.log(`Issue Records:    3 (including 1 overdue)`);
    console.log(`Maintenance:      3`);
    console.log('======================================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
