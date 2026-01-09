/** @format */
const { Products, Feedbacks, Users } = require("../models");
const { Op } = require("sequelize");
const { upload,
  imageUploadUtil,
  deleteImageUtil,
  getPublicIdFromUrl } = require("../utils/cloudinary");

const createProducts = async (req, res) => {
  const { name, description, price, category, stockQuantity } = req.body;
  const imageFile = req.file; 
  const userId = req.user.id;//1 or 2 or3 

  if (!userId) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  if (!imageFile) {
    return res.status(400).json({
      status: 400,
      message: "An image is required",
    });
            
  }

  
  try {
   
    if (!name || !description || !price || !category || stockQuantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const uploadedResponse = await imageUploadUtil(imageFile, {
      preset: 'ebee', 
      folder: 'products'
    });
      console.log("upload response", uploadedResponse)
   
   
    const product = await Products.create({
      name,
      description,
      price: parseFloat(price),
      category,
      stockQuantity: parseInt(stockQuantity),
      imageUrl: uploadedResponse.url,
      cloudinaryId: uploadedResponse.public_id,
      supplierId: userId 
    });

    res.status(201).json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category,
        cloudinaryId: product.cloudinaryId // Include for future management
      }
    });

  } catch (error) {
    console.error("Product creation error:", error)

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProducts = async (req, res) => {
  const productId = req.params.productId;
  const updates = req.body;
  const imageFile = req.file;

  try {
    const product = await Products.findByPk(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    // Handle image update
    if (imageFile) {
      // Delete old image
      if (product.cloudinaryId) {
        await deleteImageUtil(product.cloudinaryId);
      }

      // Upload new image
      const imageData = await imageUploadUtil(imageFile, {
        folder: "products"
      });
      updates.imageUrl = imageData.url;
      updates.cloudinaryId = imageData.public_id;
    }

    // Update product
    await product.update(updates);
    res.status(200).json({ success: true, message: "Product updated successfully." });

  } catch (error) {
    console.error("Product update error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteProducts = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await Products.findByPk(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    // Delete image from Cloudinary
    if (product.cloudinaryId) {
      await deleteImageUtil(product.cloudinaryId);
    }

    // Delete product
    await product.destroy();
    res.status(200).json({ 
      success: true, 
      message: "Product deleted successfully" 
    });

  } catch (error) {
    console.error("Product deletion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product"
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Products.findAll({
      include: [
        {
          model: Feedbacks,
          as: "feedbacks",
          include: [{
            model: Users,
            as: "user",
            attributes: ['id', 'name', 'email'] // Only include necessary fields
          }]
        },
        {
          model: Users,
          as: "supplier",
          attributes: ['id', 'name']
        }
      ],
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'supplierId'] // Optional field exclusion
      }
    });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProductById = async (req, res) => {
  const productId = req.params.productId;
  try {
    const product = await Products.findByPk(productId, {
      include: [
        {
          model: Feedbacks,
          as: "feedbacks",
          include: [{
            model: Users,
            as: "user",
            attributes: ['id', 'name', 'email'] // Only include necessary fields
          }]
        },
        {
          model: Users,
          as: "supplier",
          attributes: ['id', 'name']
        }
      ],
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'supplierId'] // Optional field exclusion
      }
    });

    if (product) {
      res.status(200).json({ success: true, data: product });
    } else {
      res.status(404).json({ success: false, error: `Product with ID ${productId} not found` });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const searchProducts = async (req, res) => {
  const { name, price, description, category } = req.body;

  try {
    const searchConditions = {};

    if (name) searchConditions.name = { [Op.like]: `%${name}%` };
    if (price) searchConditions.price = price;
    if (description) searchConditions.description = { [Op.like]: `%${description}%` };
    if (category) searchConditions.category = category;

    const foundProducts = await Products.findAll({ where: searchConditions });

    res.status(200).json({ success: true, data: foundProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createProducts,
  updateProducts,
  getProducts,
  getProductById,
  deleteProducts,
  searchProducts,
};
