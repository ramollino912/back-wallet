import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';

// Funciones para generar CVU y alias únicos
const generateCVU = () => {
  // CVU de 22 dígitos: 11 del prefijo + 11 aleatorios
  return '00000031000' + Math.random().toString().slice(2, 13);
};

const generateAlias = () => {
  const palabras = ['wallet', 'dinero', 'pago', 'transfer', 'cash', 'money', 'bank'];
  const palabra = palabras[Math.floor(Math.random() * palabras.length)];
  const numero = Math.floor(Math.random() * 9999) + 1;
  return `${palabra}.${numero}`;
};

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  saldo: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  cvu: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  alias: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  tipo_usuario: {
    type: DataTypes.ENUM('admin', 'usuario'),
    defaultValue: 'usuario'
  },
  google_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  hooks: {
    beforeValidate: async (usuario) => {
      // Generar CVU y alias antes de la validación
      if (!usuario.cvu) {
        usuario.cvu = generateCVU();
      }
      if (!usuario.alias) {
        usuario.alias = generateAlias();
      }
    },
    beforeCreate: async (usuario) => {
      // Hashear contraseña
      if (usuario.password) {
        usuario.password = await bcrypt.hash(usuario.password, 10);
      }
      // Asegurar CVU y alias si no existen
      if (!usuario.cvu) {
        usuario.cvu = generateCVU();
      }
      if (!usuario.alias) {
        usuario.alias = generateAlias();
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('password')) {
        usuario.password = await bcrypt.hash(usuario.password, 10);
      }
    }
  }
});

// Método para comparar contraseñas
Usuario.prototype.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

export default Usuario; 