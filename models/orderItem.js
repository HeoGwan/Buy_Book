const Sequelize = require('sequelize');

module.exports = class OrderItem extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            number: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            returnQuantity: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
        }, {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'OrderItem',
            tableName: 'order_item',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        // order 1 : N 관계 (N측, 식별)
        db.OrderItem.belongsTo(db.Order, { foreignKey: 'order_number', sourceKey: 'number' });

        // book과 1 : N 관계 (N측, 비식별)
        db.OrderItem.belongsTo(db.Book, { foreignKey: 'book_number', sourceKey: 'number' });
    }
}