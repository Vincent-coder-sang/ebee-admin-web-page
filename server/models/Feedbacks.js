/** @format */

module.exports = (sequelize, DataTypes) => {
  const Feedbacks = sequelize.define("Feedbacks", {
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT, 
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
  });

  Feedbacks.associate = (models) => {
    Feedbacks.belongsTo(models.Users, {
      foreignKey: "userId",
      as: "user",
      onDelete: "CASCADE",
    });

    Feedbacks.belongsTo(models.Products, {
      foreignKey: "productId",
      as: "product",
      onDelete: "CASCADE",
    });
  };

  return Feedbacks;
};
