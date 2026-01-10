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
			type: DataTypes.ENUM(
				"sales_summary", 
				"inventory_status", 
				"customer_analytics", 
				"product_performance", 
				"feedback_analysis", 
				"rental_activity", 
				"financial_summary", 
				"custom"
			),
			defaultValue: "custom",
		},
		content: {
			type: DataTypes.TEXT, // Using TEXT for maximum compatibility
			allowNull: false,
			defaultValue: '{}', // Default empty JSON
		},
		format: {
			type: DataTypes.ENUM("pdf", "excel", "csv", "html"),
			defaultValue: "pdf",
			allowNull: false,
		},
		filters: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		period: {
			type: DataTypes.ENUM("daily", "weekly", "monthly", "quarterly", "yearly", "custom"),
			defaultValue: "monthly",
		},
		startDate: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		endDate: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		fileUrl: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		isGenerated: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		downloadCount: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
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