'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    
    if (!tables.includes('categorias')) {
      await queryInterface.createTable('categorias', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        nombre: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true
        },
        icono: {
          type: Sequelize.STRING(50),
          allowNull: true
        },
        color: {
          type: Sequelize.STRING(20),
          allowNull: true
        }
      });

      // Insertar categorías predeterminadas solo si la tabla fue creada
      await queryInterface.bulkInsert('categorias', [
        { nombre: 'Alimentación', icono: '🍔', color: '#FF6B6B' },
        { nombre: 'Transporte', icono: '🚗', color: '#4ECDC4' },
        { nombre: 'Entretenimiento', icono: '🎮', color: '#95E1D3' },
        { nombre: 'Servicios', icono: '💡', color: '#F38181' },
        { nombre: 'Salud', icono: '🏥', color: '#AA96DA' },
        { nombre: 'Educación', icono: '📚', color: '#FCBAD3' },
        { nombre: 'Otros', icono: '📦', color: '#A8E6CF' }
      ]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('categorias');
  }
};
