const Sequelize = require('sequelize');

module.exports = class Point extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            number: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            date: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            content: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            price: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            had_user_id: {
                type: Sequelize.STRING(20),
                allowNull: true,
            }
        }, {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'Point',
            tablename: 'point',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        // creditCard와 1 : N 관계 (1측, 비식별)
        db.Point.belongsTo(db.User, { foreignKey: 'user_id', sourceKey: 'id', onDelete: 'cascade', onUpdate: 'cascade', unique: true, });
    }
}