/** @format */
module.exports = (sequelize, DataTypes) => {
  const OrderItems = sequelize.define("OrderItems", {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Products",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Orders",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  });

  OrderItems.associate = (models) => {
    OrderItems.belongsTo(models.Orders, {
      foreignKey: "orderId",
      as: "order", // singular
      onDelete: "CASCADE",
    });
    OrderItems.belongsTo(models.Products, {
      foreignKey: "productId",
      as: "product", // singular
      onDelete: "CASCADE",
    });
  };

  return OrderItems;
};
