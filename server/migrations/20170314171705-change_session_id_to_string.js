'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.changeColumn(
      'booked_sessions',
      'session_id', {
        type: Sequelize.STRING,
        allowNull: false
      }
    )
  }
};
