'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'booked_sessions',
      'datetime', {
        type: Sequelize.DATE,
        allowNull: false
      }
    )
  }
};
