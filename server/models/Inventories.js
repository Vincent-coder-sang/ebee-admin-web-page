/** @format */
module.exports = (sequelize, DataTypes) => {
  const Inventories = sequelize.define("Inventories", {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    changeType: {
      type: DataTypes.ENUM("add", "remove", "adjust"),
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
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
      allowNull: true, 
      references: {
        model: "Orders",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  });

  Inventories.associate = (models) => {
    Inventories.belongsTo(models.Orders, {
      foreignKey: "orderId",
      as: "order",
      onDelete: "CASCADE",
    });
    Inventories.belongsTo(models.Products, {
      foreignKey: "productId",
      as: "product",
      onDelete: "CASCADE",
    });
  };

  return Inventories;
};
