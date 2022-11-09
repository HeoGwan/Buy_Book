const Sequelize = require('sequelize');

module.exports = class ShippingAddress extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            zipCode: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
            },
            basicAddress: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            detailAddress: {
                type: Sequelize.TEXT,
                allowNull: false,
            }
        }, {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'ShippingAddress',
            tableName: 'shipping_address',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        // user와 1 : N 관계 (N측, 비식별)
        db.ShippingAddress.belongsTo(db.User, { foreignKey: 'user_id', sourceKey: 'id', onDelete: 'cascade', onUpdate: 'cascade', unique: true, });
    }
}