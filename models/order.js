const Sequelize = require('sequelize');

module.exports = class Order extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            number: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            orderDate: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            totalPrice: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            creditCardNumber: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            creditCardExpiration: {
                type: Sequelize.STRING(4),
                allowNull: true,
            },
            creditCardType: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            zipCode: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            basicAddress: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            detailAddress: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            ordered_user_id: {
                // 주문 했었던 회원 저장
                type: Sequelize.INTEGER,
                allowNull: true,
            },
        }, {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'Order',
            tableName: 'order_list',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        // user와 1 : N 관계 (N측, 비식별)
        db.Order.belongsTo(db.User, { foreignKey: 'user_id', sourceKey: 'id', onDelete: 'set null', onUpdate: 'cascade', unique: true });

        // book과 N : M 관계 (through: OrderItem)
        db.Order.belongsToMany(db.Book, { through: db.OrderItem, foreignKey: 'order_number', sourceKey: 'number'});
    }
}