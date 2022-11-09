const Sequelize = require('sequelize');

module.exports = class CartItem extends Sequelize.Model {
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
        }, {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'cartItem',
            tableName: 'cart_item',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        // cart와 1 : N 관계 (N측, 식별)
        db.CartItem.belongsTo(db.Cart, { foreignKey: 'cart_number', sourceKey: 'number' });

        // book과 1 : N 관계 (N측, 비식별)
        db.CartItem.belongsTo(db.Book, { foreignKey: 'book_number', sourceKey: 'number' });
    }
}