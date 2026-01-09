/** @format */
module.exports = (sequelize, DataTypes) => {
  const Dispatches = sequelize.define("Dispatches", {
    driverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users", // ✅ Corrected from "Products"
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
    deliveryDate: {
      type: DataTypes.DATEONLY, // ✅ Fixed type
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("assigned", "in_transit", "delivered"), // ✅ Fixed
      allowNull: false,
      defaultValue: "assigned",
    },
  });

  Dispatches.associate = (models) => {
    Dispatches.belongsTo(models.Orders, {
      foreignKey: "orderId",
      as: "order",
      onDelete: "CASCADE",
    });

    Dispatches.belongsTo(models.Users, {
      foreignKey: "driverId",
      as: "driver",
      onDelete: "CASCADE",
    });
  };

  return Dispatches;
};
