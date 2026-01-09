/** @format */
module.exports = (sequelize, DataTypes) => {
	const Carts = sequelize.define("Carts", {
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "Users",
				key: "id",
			},
		},

	});

	Carts.associate = (models) => {
		Carts.belongsTo(models.Users, {
			foreignKey: "userId",
			as: "user",
			onDelete: "cascade",
		});
		Carts.hasMany(models.CartItems, {
			foreignKey: "cartId",

			as: "cartitems",
			onDelete: "cascade",
		})
	};

	return Carts;
};