import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Usuario from './Usuario.js';

const Servicio = sequelize.define('Servicio', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('luz', 'agua', 'gas', 'celular'),
    allowNull: false
  },
  proveedor: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isProveedorValido(value) {
        if (this.tipo === 'celular') {
          const proveedoresCelular = ['CLARO', 'MOVISTAR', 'PERSONAL'];
          if (!proveedoresCelular.includes(value.toUpperCase())) {
            throw new Error('Para servicios celulares, el proveedor debe ser CLARO, MOVISTAR o PERSONAL');
          }
        }
      }
    }
  },
  numero_servicio: {
    type: DataTypes.STRING,
    allowNull: false
  },
  monto_mensual: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  fecha_vencimiento: {
    type: DataTypes.DATE,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'pagado', 'vencido'),
    defaultValue: 'pendiente'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  usuarioid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'usuarioid',
    references: {
      model: 'usuarios',
      key: 'id'
    }
  }
}, {
  tableName: 'servicios',
  timestamps: false,
  underscored: false
});

// No need for explicit association here since usuario_id is defined in the model
// Servicio.belongsTo(Usuario, { 
//   foreignKey: {
//     name: 'usuario_id',
//     allowNull: false
//   }
// });

export default Servicio; 