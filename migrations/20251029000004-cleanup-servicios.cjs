'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Eliminar las columnas incorrectas creadas por Sequelize
    const tableInfo = await queryInterface.describeTable('servicios');
    
    if (tableInfo.usuarioid) {
      await queryInterface.removeColumn('servicios', 'usuarioid');
    }
    
    if (tableInfo.createdat) {
      await queryInterface.removeColumn('servicios', 'createdat');
    }
    
    if (tableInfo.updatedat) {
      await queryInterface.removeColumn('servicios', 'updatedat');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // No revertir
  }
};
