/** @format */
module.exports = (sequelize, DataTypes) => {
  const CartItems = sequelize.define("CartItems", {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    cartId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Carts",
        key: "id",
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Products",
        key: "id",
      },
    },
  });

  CartItems.associate = (models) => {
    CartItems.belongsTo(models.Carts, {
      foreignKey: "cartId",
      as: "cart",
      onDelete: "cascade",
    });
    CartItems.belongsTo(models.Products, {
      foreignKey: "productId",
      as: "product",
      onDelete: "cascade",
    });
  };

  return CartItems;
};
