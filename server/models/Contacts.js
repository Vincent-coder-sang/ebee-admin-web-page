/** @format */
module.exports = (sequelize, DataTypes) => {
  const Contacts = sequelize.define("Contacts", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
   
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });

  return Contacts;
};
