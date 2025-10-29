import UsuarioModel from '../models/Usuario.js';
import Transaccion from '../models/Transaccion.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

/*
    Controladores de transferencia con Sequelize
*/

const TransferirDinero = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { destinatarioId, monto, descripcion } = req.body;
    const origenId = req.user.id;

    // Validar datos
    if (!destinatarioId || !monto || monto <= 0) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false,
        error: 'Datos de transferencia inválidos' 
      });
    }

    // Buscar usuario origen
    const usuarioOrigen = await UsuarioModel.findByPk(origenId, { transaction });
    if (!usuarioOrigen) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false,
        error: 'Usuario origen no encontrado' 
      });
    }

    // Verificar saldo suficiente
    const saldoOrigen = parseFloat(usuarioOrigen.saldo);
    if (saldoOrigen < monto) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false,
        error: 'Saldo insuficiente' 
      });
    }

    // Buscar usuario destino
    const usuarioDestino = await UsuarioModel.findByPk(destinatarioId, { transaction });
    if (!usuarioDestino) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false,
        error: 'Usuario destino no encontrado' 
      });
    }

    const saldoDestino = parseFloat(usuarioDestino.saldo);

    // Actualizar saldos
    await usuarioOrigen.update({ 
      saldo: saldoOrigen - parseFloat(monto) 
    }, { transaction });

    await usuarioDestino.update({ 
      saldo: saldoDestino + parseFloat(monto) 
    }, { transaction });

    // Registrar transacción
    await Transaccion.create({
      usuario_origen_id: origenId,
      usuario_destino_id: destinatarioId,
      tipo: 'transferencia',
      monto: parseFloat(monto),
      estado: 'completada',
      descripcion: descripcion || 'Transferencia',
      categoria: 'transferencia',
      saldo_anterior_origen: saldoOrigen,
      saldo_posterior_origen: saldoOrigen - parseFloat(monto),
      saldo_anterior_destino: saldoDestino,
      saldo_posterior_destino: saldoDestino + parseFloat(monto)
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Transferencia realizada exitosamente',
      monto: parseFloat(monto),
      descripcion: descripcion || 'Transferencia',
      destinatario: {
        nombre: usuarioDestino.nombre,
        apellido: usuarioDestino.apellido,
        email: usuarioDestino.email
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error en transferencia:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al procesar la transferencia',
      details: error.message
    });
  }
};

const BuscarUsuario = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        success: false,
        error: 'Término de búsqueda requerido' 
      });
    }

    // Buscar usuarios por nombre, apellido o email
    const usuarios = await UsuarioModel.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.iLike]: `%${query}%` } },
          { apellido: { [Op.iLike]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } }
        ],
        activo: true
      },
      attributes: ['id', 'nombre', 'apellido', 'email', 'alias', 'cvu'],
      limit: 10
    });

    res.json({ 
      success: true,
      usuarios: usuarios.map(u => ({
        id: u.id,
        nombre: u.nombre,
        apellido: u.apellido,
        email: u.email,
        alias: u.alias,
        cvu: u.cvu
      }))
    });
  } catch (error) {
    console.error('Error al buscar usuarios:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error en la búsqueda' 
    });
  }
};

const ObtenerActividades = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const usuarioId = req.user.id;

    // Buscar transacciones donde el usuario es origen o destino
    const { rows: transacciones, count } = await Transaccion.findAndCountAll({
      where: {
        [Op.or]: [
          { usuario_origen_id: usuarioId },
          { usuario_destino_id: usuarioId }
        ]
      },
      include: [
        {
          model: UsuarioModel,
          as: 'usuario_origen',
          attributes: ['id', 'nombre', 'apellido', 'email']
        },
        {
          model: UsuarioModel,
          as: 'usuario_destino',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }
      ],
      order: [['id', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const actividades = transacciones.map(t => ({
      id: t.id,
      tipo: t.tipo,
      monto: t.monto,
      descripcion: t.descripcion,
      estado: t.estado,
      categoria: t.categoria,
      esEnvio: t.usuario_origen_id === usuarioId,
      origen: t.usuario_origen ? {
        id: t.usuario_origen.id,
        nombre: t.usuario_origen.nombre,
        apellido: t.usuario_origen.apellido,
        email: t.usuario_origen.email
      } : null,
      destino: t.usuario_destino ? {
        id: t.usuario_destino.id,
        nombre: t.usuario_destino.nombre,
        apellido: t.usuario_destino.apellido,
        email: t.usuario_destino.email
      } : null
    }));

    res.json({
      success: true,
      actividades,
      total: count,
      pagina: parseInt(page),
      totalPaginas: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener actividades',
      details: error.message
    });
  }
};

const Transferencias = {
  TransferirDinero,
  BuscarUsuario,
  ObtenerActividades
};

export default Transferencias;
