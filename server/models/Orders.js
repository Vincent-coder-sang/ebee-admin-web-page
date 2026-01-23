/** @format */
module.exports = (sequelize, DataTypes) => {
  const Orders = sequelize.define("Orders", {
    orderStatus: {
      type: DataTypes.ENUM("Pending", "Processing", "Delivered", "Cancelled"),
      allowNull: true,
      defaultValue: "Pending",
    },
    paymentStatus: {
      type: DataTypes.ENUM("Pending", "Paid", "Cancelled"),
      allowNull: true,
      defaultValue: "Pending",
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    userAddressId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "UserAddresses",
        key: "id",
      },
    },
    cartId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
       model: 'Carts',
        key: "id",
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
  });

  Orders.associate = (models) => {
    Orders.belongsTo(models.UserAddresses, {
      foreignKey: "userAddressId",
      as: "userAddress", // singular
    });
    Orders.belongsTo(models.Carts, {
      foreignKey: "cartId",
      as: "cart", // singular
    });
    Orders.belongsTo(models.Users, {
      foreignKey: "userId",
      as: "user",
    });
    Orders.hasMany(models.OrderItems, {
      foreignKey: "orderId",
      as: "orderItems", // correct plural
      onDelete: "CASCADE",
    });
  };

  return Orders;
};
