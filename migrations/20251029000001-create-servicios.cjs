'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    
    // Solo crear la tabla si NO existe
    if (!tables.includes('servicios')) {
      await queryInterface.createTable('servicios', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        usuario_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'usuarios',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        nombre: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        tipo: {
          type: Sequelize.ENUM('luz', 'agua', 'gas', 'celular'),
          allowNull: false
        },
        proveedor: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        numero_servicio: {
          type: Sequelize.STRING(50),
          allowNull: false
        },
        monto_mensual: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false
        },
        fecha_vencimiento: {
          type: Sequelize.DATEONLY,
          allowNull: false
        },
        activo: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        }
      });

      // Agregar índice para búsquedas rápidas por usuario
      await queryInterface.addIndex('servicios', ['usuario_id']);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('servicios');
  }
};
