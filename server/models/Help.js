/** @format */

module.exports = (sequelize, DataTypes) => {
	const Helps = sequelize.define("Helps", {
		title: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		content: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		section: {
			type: DataTypes.ENUM("general", "orders", "rentals", "services", "payments", "account"),
			defaultValue: "general",
		},
	});

	return Helps;
};
