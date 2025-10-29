/*const { readData, saveData } = require('../db');

const getSaldo = (req, res) => {
    const data = readData();
    res.json({ saldo: data.saldo });
};

const transferirDinero = (req, res) => {
    const { monto, descripcion } = req.body;
    const data = readData();

    if (monto > 0) {
        data.saldo += monto;
        data.transacciones.push({
            tipo: 'recepción',
            monto,
            descripcion,
            fecha: new Date().toISOString()
        });
        saveData(data);
        res.json({ mensaje: 'Transferencia realizada con éxito', saldo: data.saldo });
    } else {
        res.status(400).json({ mensaje: 'Monto inválido' });
    }
};

const getTransacciones = (req, res) => {
    const data = readData();
    res.json(data.transacciones);
};

module.exports = { getSaldo, transferirDinero, getTransacciones };
*/
/*
const express = require('express');
const app = express();
const { readData, saveData } = require('../db');
const { getSaldo, transferirDinero, getTransacciones } = require('./wallet.js');

//para analizar el json
app.use(express.json());

// Obtiene el  saldo actual
const getSaldo = (req, res) => {
    const data = readData();
    res.json({ saldo_cuenta: data.saldo_cuenta });
};

// Realiza una transferencia de dinero
const transferirDinero = (req, res) => {
    const { transferencia, alias, cvu } = req.body;
    const data = readData();

    if (transferencia > 0) {
        // Se supone que 'recibir' es el monto recibido y se añade al saldo actual
        data.saldo_cuenta += transferencia;

        // Agrega la transacción a la lista
        data.transacciones.push({
            tipo: 'recepción',
            monto: transferencia,
            alias,
            cvu,
            hora_fecha: new Date().toISOString()
        });
        
        // Guarda los cambios en la base de datos
        saveData(data);
        res.json({ mensaje: 'Transferencia realizada con éxito', saldo_cuenta: data.saldo_cuenta });
    } else {
        res.status(400).json({ mensaje: 'Monto inválido' });
    }
};

// Obtiene todas las transacciones
const getTransacciones = (req, res) => {
    const data = readData();
    res.json(data.transacciones);
};
*/

//module.exports = { getSaldo, transferirDinero, getTransacciones };
import UsuarioModel from '../models/Usuario.js';
import Transaccion from '../models/Transaccion.js';
import Servicio from '../models/Servicio.js';
import TarjetaTransporte from '../models/TarjetaTransporte.js';
import { Op, fn, col } from 'sequelize';

const walletController = {
  // Obtener estado general del wallet del usuario
  obtenerEstado: async (req, res) => {
    try {
      const usuarioId = req.user.id;

      // Obtener datos del usuario
      const usuario = await UsuarioModel.findByPk(usuarioId, {
        attributes: ['id', 'nombre', 'apellido', 'email', 'saldo']
      });

      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Contar transacciones
      const totalTransacciones = await Transaccion.count({
        where: {
          [Op.or]: [
            { usuario_origen_id: usuarioId },
            { usuario_destino_id: usuarioId }
          ]
        }
      });

      // Contar servicios activos
      const serviciosActivos = await Servicio.count({
        where: { usuario_id: usuarioId, activo: true }
      });

      // Contar tarjetas de transporte activas
      const tarjetasActivas = await TarjetaTransporte.count({
        where: { usuario_id: usuarioId, activo: true }
      });

      // Calcular gastos del mes actual - Nota: transacciones no tiene created_at
      // const inicioMes = new Date();
      // inicioMes.setDate(1);
      // inicioMes.setHours(0, 0, 0, 0);

      // const gastosDelMes = await Transaccion.sum('monto', {
      //   where: {
      //     usuario_origen_id: usuarioId,
      //     tipo: { [Op.in]: ['pago_servicio', 'recarga_transporte', 'transferencia'] },
      //     created_at: { [Op.gte]: inicioMes }
      //   }
      // }) || 0;

      // Por ahora devolvemos 0 hasta que agreguemos timestamps a transacciones
      const gastosDelMes = 0;

      return res.status(200).json({
        success: true,
        data: {
          usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            saldo: parseFloat(usuario.saldo || 0)
          },
          estadisticas: {
            total_transacciones: totalTransacciones,
            servicios_activos: serviciosActivos,
            tarjetas_activas: tarjetasActivas,
            gastos_mes_actual: parseFloat(gastosDelMes || 0)
          }
        }
      });
    } catch (error) {
      console.error('Error al obtener estado del wallet:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener el estado del wallet',
        error: error.message
      });
    }
  }
};

export default walletController; 