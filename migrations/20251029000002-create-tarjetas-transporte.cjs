'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tarjetas_transporte', {
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
      numero_tarjeta: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      tipo: {
        type: Sequelize.ENUM('sube', 'bip', 'tullave'),
        allowNull: false
      },
      saldo: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      alias: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      activa: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }
    });

    // Agregar índices
    await queryInterface.addIndex('tarjetas_transporte', ['usuario_id']);
    await queryInterface.addIndex('tarjetas_transporte', ['numero_tarjeta'], { unique: true });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tarjetas_transporte');
  }
};
