const Sequelize = require('sequelize');

module.exports = class Cart extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            number: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            createDate: {
                type: Sequelize.DATE,
                allowNull: true,
            },
        }, {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'Cart',
            tableName: 'cart',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        // user와 1 : N 관계 (N측, 비식별)
        db.Cart.belongsTo(db.User, { foreignKey: 'user_id', sourceKey: 'id', onDelete: 'cascade', onUpdate: 'cascade', unique: true });

        // book과 N : M 관계 (through: CartItem)
        db.Cart.belongsToMany(db.Book, { through: db.CartItem, foreignKey: 'cart_number', sourceKey: 'number'});
    }
}