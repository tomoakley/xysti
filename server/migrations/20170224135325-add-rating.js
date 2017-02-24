'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'booked_sessions',
      'rating', {
        type: Sequelize.INTEGER,
        allowNull: true
      }
    )
  }
};
