/** @format */

const { UserAddresses, sequelize } = require("../models");

const createAddress = async (req, res) => {
  const { county, phoneNumber, postalCode, street, subCounty, ward } = req.body;
  const userId = req.user.id;

  // Validate Kenyan phone number
  const phoneRegex = /^(?:\+254|0)[17]\d{8}$/;
  if (!phoneRegex.test(phoneNumber)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Kenyan phone number format. Use +254... or 07..."
    });
  }

  // Validate postal code (5 digits for Kenya)
  if (!/^\d{5}$/.test(postalCode)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Kenyan postal code (must be 5 digits)"
    });
  }

  const t = await sequelize.transaction();

  try {
    

    const newAddress = await UserAddresses.create({
      
      county,
      phoneNumber,
      postalCode,
      street,
      subCounty,
      ward,
      userId
    }, { transaction: t });

    await t.commit();

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: newAddress
    });

  } catch (error) {
    

    res.status(500).json({ 
      success: false, 
      message: "Failed to create address: " + error.message 
    });
  }
};

const updateUserAddress = async (req, res) => {
  const addressId = req.params.addressId;
  const { county, phoneNumber, postalCode, street, subCounty, ward } = req.body;

  try {
    const userAddress = await UserAddresses.findByPk(addressId);

    if (!userAddress) {
      return res.status(404).json({
        success: false,
        message: "User address not found",
      });
    }

    await userAddress.update({
      county, phoneNumber, postalCode, street, subCounty, ward
    });

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: userAddress,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserAddress = async (req, res) => {
  const userId = req.user.id;
  try {
    const addresses = await UserAddresses.findAll({where: {userId
    }});

    if (!addresses.length) {
      return res.status(404).json({ success: false, message: "No address found" });
    }

    res.status(200).json({ success: true, data: addresses });
  } catch (error) {
   
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAddress = async (req, res) => {
  const addressId = req.params.addressId;

  try {
    const userAddress = await UserAddresses.findByPk(addressId);

    if (!userAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    await UserAddresses.destroy({ where: { id: addressId } });

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAddress,
  updateUserAddress,
  getUserAddress,
  deleteAddress,
};
