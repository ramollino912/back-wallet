import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Categoria = sequelize.define('Categoria', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '#007bff'
  },
  icono: {
    type: DataTypes.STRING,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'categorias',
  timestamps: false
});

export default Categoria; 