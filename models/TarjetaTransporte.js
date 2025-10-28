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
  }
}, {
  tableName: 'tarjetas_transporte',
  timestamps: true
});

// Relaciones
TarjetaTransporte.belongsTo(Usuario, { foreignKey: 'usuario_id' });

export default TarjetaTransporte; 