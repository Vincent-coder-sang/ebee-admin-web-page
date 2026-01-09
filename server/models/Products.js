/** @format */

module.exports = (sequelize, DataTypes) => {
  const Products = sequelize.define("Products", {
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
     cloudinaryId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM("bike", "spare-part", "accessory", "helmet", "service"),
      allowNull: false,
    },
    stockQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    supplierId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  });

  Products.associate = (models) => {
    Products.belongsTo(models.Users, {
      foreignKey: "supplierId",
      as: "supplier",
      onDelete: "CASCADE",
    });

    Products.hasMany(models.CartItems, {
      foreignKey: "productId",
      as: "cartItems",
      onDelete: "CASCADE",
    });

    Products.hasMany(models.OrderItems, {
      foreignKey: "productId",
      as: "orderItems",
      onDelete: "CASCADE",
    });

    Products.hasMany(models.Inventories, {
      foreignKey: "productId",
      as: "inventoryLogs",
      onDelete: "CASCADE",
    });

    Products.hasMany(models.Feedbacks, {
      foreignKey: "productId",
      as: "feedbacks",
      onDelete: "CASCADE",
    });
  };

  return Products;
};
