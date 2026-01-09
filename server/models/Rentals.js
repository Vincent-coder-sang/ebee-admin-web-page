/** @format */
module.exports = (sequelize, DataTypes) => {
  const Rentals = sequelize.define("Rentals", {
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
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    rentStart: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    rentEnd: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fineId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Fines",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    staffId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    status: {
      type: DataTypes.ENUM("pending", "paid", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
    },
  });

  Rentals.associate = (models) => {
    Rentals.belongsTo(models.Users, {
      foreignKey: "userId",
      as: "user",
      onDelete: "CASCADE",
    });

    Rentals.belongsTo(models.Products, {
      foreignKey: "productId",
      as: "product",
      onDelete: "CASCADE",
    });

    Rentals.belongsTo(models.Users, {
      foreignKey: "staffId",
      as: "staff",
      onDelete: "SET NULL",
    });

    Rentals.belongsTo(models.Fines, {
      foreignKey: "fineId",
      as: "fine",
      onDelete: "SET NULL",
    });
  };

  return Rentals;
};
