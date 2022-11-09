const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            name: {
                type: Sequelize.STRING(10),
                allowNull: false,
            },
        }, {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'User',
            tablename: 'user',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        // creditCard와 1 : N 관계 (1측, 비식별)
        db.User.hasMany(db.CreditCard, { foreignKey: 'user_id', sourceKey: 'id', onDelete: 'cascade', onUpdate: 'cascade' });

        // shippingAddress와 1 : N 관계 (1측, 비식별)
        db.User.hasMany(db.ShippingAddress, { foreignKey: 'user_id', sourceKey: 'id', onDelete: 'cascade', onUpdate: 'cascade' });

        // cart과 1 : N 관계 (1측, 비식별)
        db.User.hasMany(db.Cart, { foreignKey: 'user_id', sourceKey: 'id', onDelete: 'cascade', onUpdate: 'cascade' });

        // order 1 : N 관계 (1측, 비식별)
        db.User.hasMany(db.Order, { foreignKey: 'user_id', sourceKey: 'id', onDelete: 'set null', onUpdate: 'cascade' });
    }
}