/** @format */
module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define("Users", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetTokenExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    userType: {
      type: DataTypes.ENUM(
        "customer",
        "admin",
        "finance_manager",
        "inventory_manager",
        "dispatch_manager",
        "service_manager",
        "supplier",
        "technician_manager",
        "driver"
      ),
      allowNull: false,
      defaultValue: "customer",
    },
  });

  Users.associate = (models) => {
    Users.hasMany(models.Feedbacks, {
      foreignKey: "userId",
      as: "feedbacks",
      onDelete: "cascade",
    });

    Users.hasMany(models.Orders, {
      foreignKey: "userId",
      as: "orders",
      onDelete: "cascade",
    });

    Users.hasMany(models.UserAddresses, {
      foreignKey: "userId",
      as: "addresses",
      onDelete: "cascade",
    });

    Users.hasMany(models.Payments, {
      foreignKey: "userId",
      as: "payments",
      onDelete: "cascade",
    });
  };

  return Users;
};
