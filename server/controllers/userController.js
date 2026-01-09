const { Users } = require("../models");


const deleteUser = async (req, res) => {
  const userId = req.params.userId;

  const user = Users.findOne({where: {
    id: userId
  }})

  if(!user){
    return res.status(403).json({
      success: false,
      message: "User not found."
    })
  }

  try {
   
    await Users.destroy(user);

 
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
  
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  const userId = req.params.userId;
  const { email,phoneNumber, name, password, isApproved, userType } = req.body;

  try {
    // Check if the requester is an admin
    const requester = await Users.findByPk(req.user.id);
    if (!requester || requester.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only admins can perform this action",
      });
    }

    const user = await Users.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admins from modifying their own admin status
    if (user.id === requester.id && userType && userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "You cannot change your own admin status",
      });
    }

    // Update user
    const updatedUser =  await Users.update(
      { email, name, password, phoneNumber, isApproved, userType },
      { where: { id: userId } }
    );

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUsers = async (req, res) => {
  try {

    const users = await Users.findAll();

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  const userId = req.params.userId;

  try {

    const user = await Users.findOne(
      { where: { id: userId } },
      {
        attributes: { exclude: ["password"] },
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
  
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const approveUsers = async (req, res) => {
  const userId = req.params.userId;
  const updates = req.body;

  try {
    const requester = await Users.findByPk(req.user.id);
    if (!requester || requester.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only admins can perform this action",
      });
    }

    const user = await Users.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const allowFields = ["name", "password", "email", "phoneNumber", "isApproved", "userType"]

    Object.keys(updates).forEach((key) =>{
      if(!allowFields.includes(key)){
        delete updates[key];
      }
    })

    await user.update(updates)

    res.status(200).json({
      success: true,
      message: "User approved successfully",
      data: {
        id: user.idm,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isApproved: user.isApproved,
        userType: user.userType
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Specifically for approval actions only
const approveUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const requester = await Users.findByPk(req.user.id);
    if (!requester || requester.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only admins can perform this action",
      });
    }

    const user = await Users.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isApproved = req.body.isApproved !== undefined ? req.body.isApproved : true;
    
    await user.update({ isApproved });

    res.status(200).json({
      success: true,
      message: isApproved ? "User approved successfully" : "User approval revoked successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        isApproved: user.isApproved,
        userType: user.userType
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  deleteUser,
  getUsers,
  updateUser,
  getUserById,
  approveUser,
  approveUsers
};
