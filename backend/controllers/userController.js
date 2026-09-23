const User = require('../models/User');
const { logAudit } = require('../middleware/auditLogger');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin Only)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving users',
      error: error.message,
    });
  }
};

// @desc    Update user (role, status, department)
// @route   PUT /api/users/:id
// @access  Private (Admin Only)
exports.updateUser = async (req, res) => {
  try {
    const { name, role, department, status, phone } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (department) user.department = department;
    if (status) user.status = status;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    await logAudit({
      user: req.user,
      req,
      action: 'UPDATE_USER',
      module: 'User',
      recordId: user._id,
      description: `Updated user ${user.name} (${user.email}): Role=${user.role}, Status=${user.status}.`,
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin Only)
exports.deleteUser = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Administrators cannot delete their own active account.',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    await logAudit({
      user: req.user,
      req,
      action: 'DELETE_USER',
      module: 'User',
      recordId: req.params.id,
      description: `Deleted user account: ${user.name} (${user.email}).`,
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message,
    });
  }
};
