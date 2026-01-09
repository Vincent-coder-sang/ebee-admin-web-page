/** @format */
module.exports = (sequelize, DataTypes) => {
  const Payments = sequelize.define("Payments", {
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    checkoutRequestId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mpesaReceiptNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow null initially
      references: {
        model: "Orders",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  });

  Payments.associate = (models) => {
    Payments.belongsTo(models.Users, {
      foreignKey: "userId",
      as: "user",
      onDelete: "CASCADE",
    });

    Payments.belongsTo(models.Orders, {
      foreignKey: "orderId",
      as: "order",
      onDelete: "CASCADE",
    });
  };

  return Payments;
};
