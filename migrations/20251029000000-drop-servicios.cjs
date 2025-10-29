'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Verificar si la tabla existe
    const tables = await queryInterface.showAllTables();
    
    if (tables.includes('servicios')) {
      // Verificar si la columna usuario_id ya existe
      const tableInfo = await queryInterface.describeTable('servicios');
      
      if (!tableInfo.usuario_id) {
        // Agregar la columna usuario_id si no existe
        await queryInterface.addColumn('servicios', 'usuario_id', {
          type: Sequelize.INTEGER,
          allowNull: true, // Temporalmente nullable
          references: {
            model: 'usuarios',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        });
        
        // Agregar índice
        await queryInterface.addIndex('servicios', ['usuario_id']);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('servicios')) {
      await queryInterface.removeColumn('servicios', 'usuario_id');
    }
  }
};
