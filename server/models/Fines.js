/** @format */

module.exports = (sequelize, DataTypes) => {
	const Fines = sequelize.define("Fines", {
		reason: {
			type: DataTypes.STRING, // ✅ changed from INTEGER to STRING
			allowNull: false,
		},
		amount: {
			type: DataTypes.DECIMAL(10, 2), // ✅ Added amount field (usually needed for fines)
			allowNull: false,
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
		rentalId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "Rentals", // ✅ Corrected from "Products"
				key: "id",
			},
			onDelete: "CASCADE",
			onUpdate: "CASCADE",
		},
	});

	Fines.associate = (models) => {
		Fines.belongsTo(models.Users, {
			foreignKey: "userId",
			as: "user",
			onDelete: "CASCADE",
		});
		Fines.belongsTo(models.Rentals, {
			foreignKey: "rentalId",
			as: "rental",
			onDelete: "CASCADE",
		});
	};

	return Fines;
};
