/** @format */
module.exports = (sequelize, DataTypes) => {
	const Reports = sequelize.define("Reports", {
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
		title: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		type: {
			type: DataTypes.ENUM("orders", "rentals", "payments", "inventory", "feedback", "custom"),
			defaultValue: "custom",
		},
		content: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
	});

	Reports.associate = (models) => {
		Reports.belongsTo(models.Users, {
			foreignKey: "userId",
			as: "user",
			onDelete: "CASCADE",
		});
	};

	return Reports;
};
