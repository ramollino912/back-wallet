import Servicio from '../models/Servicio.js';
import Usuario from '../models/Usuario.js';
import Transaccion from '../models/Transaccion.js';

// Obtener proveedores disponibles
export const ObtenerProveedores = async (req, res) => {
  try {
    const proveedores = {
      luz: ['EDESUR', 'EDENOR', 'EDELAP', 'EDES'],
      agua: ['AYSA', 'AGUAS CORDOBESAS', 'AGUAS DEL VALLE'],
      gas: ['METROGAS', 'GAS NATURAL BAN', 'GAS DEL ESTE'],
      celular: ['CLARO', 'MOVISTAR', 'PERSONAL']
    };

    res.json(proveedores);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear nuevo servicio
export const CrearServicio = async (req, res) => {
  try {
    const { nombre, tipo, proveedor, numero_servicio, monto_mensual, fecha_vencimiento } = req.body;
    const usuario_id = req.user.id;

    if (!nombre || !tipo || !proveedor || !numero_servicio || !monto_mensual || !fecha_vencimiento) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const servicio = await Servicio.create({
      nombre,
      tipo,
      proveedor,
      numero_servicio,
      monto_mensual,
      fecha_vencimiento,
      usuario_id
    });

    res.status(201).json({
      message: 'Servicio creado exitosamente',
      servicio
    });
  } catch (error) {
    console.error('Error al crear servicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener servicios del usuario
export const ObtenerServicios = async (req, res) => {
  try {
    const usuario_id = req.user.id;

    const servicios = await Servicio.findAll({
      where: { usuario_id, activo: true },
      order: [['fecha_vencimiento', 'ASC']]
    });

    res.json(servicios);
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Cambiar servicio celular
export const CambiarServicioCelular = async (req, res) => {
  try {
    const { servicio_id } = req.params;
    const { nuevo_proveedor, nuevo_numero } = req.body;
    const usuario_id = req.user.id;

    const servicio = await Servicio.findOne({
      where: { id: servicio_id, usuario_id, tipo: 'celular' }
    });

    if (!servicio) {
      return res.status(404).json({ error: 'Servicio celular no encontrado' });
    }

    await servicio.update({
      proveedor: nuevo_proveedor,
      numero_servicio: nuevo_numero
    });

    res.json({
      message: 'Servicio celular actualizado exitosamente',
      servicio
    });
  } catch (error) {
    console.error('Error al cambiar servicio celular:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Limpiar servicios celulares
export const LimpiarServiciosCelulares = async (req, res) => {
  try {
    const usuario_id = req.user.id;

    await Servicio.update(
      { activo: false },
      { where: { usuario_id, tipo: 'celular' } }
    );

    res.json({
      message: 'Servicios celulares eliminados exitosamente'
    });
  } catch (error) {
    console.error('Error al limpiar servicios celulares:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Pagar servicio
export const PagarServicio = async (req, res) => {
  try {
    const { servicio_id } = req.params;
    const usuario_id = req.user.id;

    const servicio = await Servicio.findOne({
      where: { id: servicio_id, usuario_id, activo: true }
    });

    if (!servicio) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    const usuario = await Usuario.findByPk(usuario_id);

    if (usuario.saldo < servicio.monto_mensual) {
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    // Actualizar saldo del usuario
    await usuario.update({
      saldo: parseFloat(usuario.saldo) - parseFloat(servicio.monto_mensual)
    });

    // Actualizar estado del servicio
    await servicio.update({ estado: 'pagado' });

    // Crear transacción
    await Transaccion.create({
      monto: servicio.monto_mensual,
      tipo: 'pago_servicio',
      estado: 'completada',
      descripcion: `Pago de ${servicio.tipo} - ${servicio.proveedor}`,
      categoria: servicio.tipo,
      referencia: servicio.numero_servicio,
      usuario_origen_id: usuario_id,
      saldo_anterior_origen: usuario.saldo,
      saldo_posterior_origen: parseFloat(usuario.saldo) - parseFloat(servicio.monto_mensual)
    });

    res.json({
      message: 'Servicio pagado exitosamente',
      saldo_actual: parseFloat(usuario.saldo) - parseFloat(servicio.monto_mensual)
    });
  } catch (error) {
    console.error('Error al pagar servicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Pagar todos los servicios
export const PagarTodosLosServicios = async (req, res) => {
  try {
    const usuario_id = req.user.id;

    const servicios = await Servicio.findAll({
      where: { usuario_id, activo: true, estado: 'pendiente' }
    });

    if (servicios.length === 0) {
      return res.status(400).json({ error: 'No hay servicios pendientes para pagar' });
    }

    const usuario = await Usuario.findByPk(usuario_id);
    const total = servicios.reduce((sum, servicio) => sum + parseFloat(servicio.monto_mensual), 0);

    if (usuario.saldo < total) {
      return res.status(400).json({ error: 'Saldo insuficiente para pagar todos los servicios' });
    }

    // Actualizar saldo del usuario
    await usuario.update({
      saldo: parseFloat(usuario.saldo) - total
    });

    // Actualizar todos los servicios
    for (const servicio of servicios) {
      await servicio.update({ estado: 'pagado' });

      // Crear transacción para cada servicio
      await Transaccion.create({
        monto: servicio.monto_mensual,
        tipo: 'pago_servicio',
        estado: 'completada',
        descripcion: `Pago de ${servicio.tipo} - ${servicio.proveedor}`,
        categoria: servicio.tipo,
        referencia: servicio.numero_servicio,
        usuario_origen_id: usuario_id,
        saldo_anterior_origen: usuario.saldo,
        saldo_posterior_origen: parseFloat(usuario.saldo) - total
      });
    }

    res.json({
      message: 'Todos los servicios pagados exitosamente',
      servicios_pagados: servicios.length,
      total_pagado: total,
      saldo_actual: parseFloat(usuario.saldo) - total
    });
  } catch (error) {
    console.error('Error al pagar todos los servicios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar servicio
export const EliminarServicio = async (req, res) => {
  try {
    const { servicio_id } = req.params;
    const usuario_id = req.user.id;

    const servicio = await Servicio.findOne({
      where: { id: servicio_id, usuario_id }
    });

    if (!servicio) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    await servicio.update({ activo: false });

    res.json({
      message: 'Servicio eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}; 