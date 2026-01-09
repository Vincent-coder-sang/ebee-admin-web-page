/** @format */

module.exports = (sequelize, DataTypes) => {
  const Services = sequelize.define("Services", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "SET NULL",
    },
  });

  Services.associate = (models) => {
    Services.belongsTo(models.Users, {
      foreignKey: "userId",
      as: "user", // Creator/owner of the service (if needed)
      onDelete: "SET NULL",
    });

    Services.hasMany(models.Bookings, {
      foreignKey: "serviceId",
      as: "bookings",
      onDelete: "CASCADE", // If a service is deleted, its bookings go too
      hooks: true, // IMPORTANT for CASCADE to work properly in Sequelize
    });
  };

  return Services;
};
