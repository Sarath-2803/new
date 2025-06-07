'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Item.belongsTo(models.User, {
        foreignKey: 'userId',
      });
      // define association here
      // Item.belongsTo(models.Users, {
      //   foreignKey: 'userId'
      // });
    }

    static getAllItem(userId) {
      return this.findAll(
        { where: { userId } },
      );
    }

    static addItem({ name, image, price, userId }) {
      return this.create({
        name,
        image,
        price,
        userId
      });
    }

    static updateItem({ id, name, image, price,userId }) {
      return this.update(
        { name, image, price },
        { where: { id,userId } }
      );
    }
    
    static deleteItem({id,userId}) {
      return this.destroy({ where: { id,userId } });
    }
  }
  Item.init({
    name: DataTypes.STRING,
    image: DataTypes.STRING,
    price: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Item',
  });
  return Item;
};