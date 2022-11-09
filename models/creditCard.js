const Sequelize = require('sequelize');

module.exports = class CreditCard extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            number: {
                type: Sequelize.STRING,
                allowNull: false,
                primaryKey: true,
            },
            expiration: {
                type: Sequelize.STRING(4),
                allowNull: false,
            },
            type: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        }, {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'CreditCard',
            tableName: 'credit_card',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        // user와 1 : N 관계 (N측, 비식별)
        db.CreditCard.belongsTo(db.User, { foreignKey: 'user_id', sourceKey: 'id', onDelete: 'cascade', onUpdate: 'cascade', unique: true, });
    }
}