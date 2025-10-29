import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Usuario from './Usuario.js';

const TarjetaTransporte = sequelize.define('TarjetaTransporte', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_tarjeta: {
    type: DataTypes.STRING,
    allowNull: false
  },
  empresa: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'SUBE'
  },
  saldo: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  }
}, {
  tableName: 'tarjetas_transporte',
  timestamps: false,
  underscored: true
});

// No usar belongsTo ya que el campo esta definido explicitamente
export default TarjetaTransporte; 