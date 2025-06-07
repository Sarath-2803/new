'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Items', 'userId', {
      type: Sequelize.DataTypes.INTEGER,
    });

    await queryInterface.addConstraint('Items', {
      fields: ['userId'],
      type: 'foreign key',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE',   // or 'CASCADE' if you want to delete items when a user is deleted
      onUpdate: 'CASCADE'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Items', 'userId');
  }
};
