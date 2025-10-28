import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Usuario from './Usuario.js';

const Transaccion = sequelize.define('Transaccion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('transferencia', 'pago_servicio', 'recarga_transporte', 'recarga_saldo'),
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'completada', 'rechazada'),
    defaultValue: 'pendiente'
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: true
  },
  referencia: {
    type: DataTypes.STRING,
    allowNull: true
  },
  saldo_anterior_origen: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  saldo_anterior_destino: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  saldo_posterior_origen: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  saldo_posterior_destino: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  }
}, {
  tableName: 'transacciones',
  timestamps: true
});

// Relaciones
Transaccion.belongsTo(Usuario, { as: 'usuario_origen', foreignKey: 'usuario_origen_id' });
Transaccion.belongsTo(Usuario, { as: 'usuario_destino', foreignKey: 'usuario_destino_id' });

export default Transaccion; 