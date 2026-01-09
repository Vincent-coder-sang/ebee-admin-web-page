/** @format */

module.exports = (sequelize, DataTypes) => {
  const Bookings = sequelize.define("Bookings", {
    serviceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Services",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false, // The customer must exist
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "CASCADE", // If user is deleted, remove their bookings
    },

    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: true, // Can be null initially — a technician may not be assigned yet
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "SET NULL", // If technician is deleted, set to null
    },

    status: {
      type: DataTypes.ENUM("pending", "confirmed", "completed", "cancelled"),
      defaultValue: "pending",
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  Bookings.associate = (models) => {
    Bookings.belongsTo(models.Services, {
      foreignKey: "serviceId",
      as: "service",
      onDelete: "CASCADE",
    });

    Bookings.belongsTo(models.Users, {
      foreignKey: "userId",
      as: "user", // The customer who made the booking
      onDelete: "CASCADE",
    });

    Bookings.belongsTo(models.Users, {
      foreignKey: "assignedTo",
      as: "technician", // The assigned technician
      onDelete: "SET NULL",
    });
  };

  return Bookings;
};
