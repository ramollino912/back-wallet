import TarjetaTransporte from '../models/TarjetaTransporte.js';
import Usuario from '../models/Usuario.js';
import Transaccion from '../models/Transaccion.js';

// Obtener empresas de transporte disponibles
export const ObtenerEmpresasTransporte = async (req, res) => {
  try {
    const empresas = ['SUBE', 'DIPLOMATICO', 'MOVE', 'BONDICARD'];
    res.json(empresas);
  } catch (error) {
    console.error('Error al obtener empresas de transporte:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Registrar nueva tarjeta de transporte
export const RegistrarTarjeta = async (req, res) => {
  try {
    const { numero_tarjeta, empresa } = req.body;
    const usuario_id = req.user.id;

    if (!numero_tarjeta || !empresa) {
      return res.status(400).json({ error: 'Número de tarjeta y empresa son requeridos' });
    }

    const tarjeta = await TarjetaTransporte.create({
      numero_tarjeta,
      empresa,
      usuario_id
    });

    res.status(201).json({
      message: 'Tarjeta registrada exitosamente',
      tarjeta
    });
  } catch (error) {
    console.error('Error al registrar tarjeta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener tarjetas del usuario
export const ObtenerTarjetas = async (req, res) => {
  try {
    const usuario_id = req.user.id;

    const tarjetas = await TarjetaTransporte.findAll({
      where: { usuario_id, activo: true }
    });

    res.json(tarjetas);
  } catch (error) {
    console.error('Error al obtener tarjetas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener tarjetas desactivadas
export const ObtenerTarjetasDesactivadas = async (req, res) => {
  try {
    const usuario_id = req.user.id;

    const tarjetas = await TarjetaTransporte.findAll({
      where: { usuario_id, activo: false }
    });

    res.json(tarjetas);
  } catch (error) {
    console.error('Error al obtener tarjetas desactivadas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Recargar tarjeta
export const RecargarTarjeta = async (req, res) => {
  try {
    const { tarjeta_id, monto } = req.body;
    const usuario_id = req.user.id;

    if (!tarjeta_id) {
      return res.status(400).json({ error: 'ID de tarjeta es requerido' });
    }

    if (!monto || monto <= 0) {
      return res.status(400).json({ error: 'Monto válido es requerido' });
    }

    const tarjeta = await TarjetaTransporte.findOne({
      where: { id: tarjeta_id, usuario_id, activo: true }
    });

    if (!tarjeta) {
      return res.status(404).json({ error: 'Tarjeta no encontrada' });
    }

    const usuario = await Usuario.findByPk(usuario_id);

    if (parseFloat(usuario.saldo) < parseFloat(monto)) {
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    // Actualizar saldo del usuario
    await usuario.update({
      saldo: parseFloat(usuario.saldo) - parseFloat(monto)
    });

    // Actualizar saldo de la tarjeta
    await tarjeta.update({
      saldo: parseFloat(tarjeta.saldo) + parseFloat(monto)
    });

    // Crear transacción
    await Transaccion.create({
      monto,
      tipo: 'recarga_transporte',
      estado: 'completada',
      descripcion: `Recarga de tarjeta ${tarjeta.empresa}`,
      categoria: 'transporte',
      referencia: tarjeta.numero_tarjeta,
      usuario_origen_id: usuario_id,
      saldo_anterior_origen: usuario.saldo,
      saldo_posterior_origen: parseFloat(usuario.saldo) - parseFloat(monto)
    });

    res.json({
      message: 'Tarjeta recargada exitosamente',
      saldo_tarjeta: parseFloat(tarjeta.saldo) + parseFloat(monto),
      saldo_usuario: parseFloat(usuario.saldo) - parseFloat(monto)
    });
  } catch (error) {
    console.error('Error al recargar tarjeta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar tarjeta
export const EliminarTarjeta = async (req, res) => {
  try {
    const { tarjeta_id } = req.params;
    const usuario_id = req.user.id;

    const tarjeta = await TarjetaTransporte.findOne({
      where: { id: tarjeta_id, usuario_id }
    });

    if (!tarjeta) {
      return res.status(404).json({ error: 'Tarjeta no encontrada' });
    }

    await tarjeta.update({ activo: false });

    res.json({
      message: 'Tarjeta eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar tarjeta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Reactivar tarjeta
export const ReactivarTarjeta = async (req, res) => {
  try {
    const { tarjeta_id } = req.params;
    const usuario_id = req.user.id;

    const tarjeta = await TarjetaTransporte.findOne({
      where: { id: tarjeta_id, usuario_id, activo: false }
    });

    if (!tarjeta) {
      return res.status(404).json({ error: 'Tarjeta no encontrada' });
    }

    await tarjeta.update({ activo: true });

    res.json({
      message: 'Tarjeta reactivada exitosamente',
      tarjeta
    });
  } catch (error) {
    console.error('Error al reactivar tarjeta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener saldo de tarjeta
export const ObtenerSaldoTarjeta = async (req, res) => {
  try {
    const { tarjeta_id } = req.params;
    const usuario_id = req.user.id;

    const tarjeta = await TarjetaTransporte.findOne({
      where: { id: tarjeta_id, usuario_id, activo: true }
    });

    if (!tarjeta) {
      return res.status(404).json({ error: 'Tarjeta no encontrada' });
    }

    res.json({
      saldo: tarjeta.saldo,
      empresa: tarjeta.empresa,
      numero_tarjeta: tarjeta.numero_tarjeta
    });
  } catch (error) {
    console.error('Error al obtener saldo de tarjeta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener estadísticas de transporte
export const ObtenerEstadisticasTransporte = async (req, res) => {
  try {
    const usuario_id = req.user.id;

    const tarjetas = await TarjetaTransporte.findAll({
      where: { usuario_id, activo: true }
    });

    const totalSaldo = tarjetas.reduce((sum, tarjeta) => sum + parseFloat(tarjeta.saldo), 0);
    const totalTarjetas = tarjetas.length;

    const estadisticas = {
      total_tarjetas: totalTarjetas,
      total_saldo: totalSaldo,
      promedio_saldo: totalTarjetas > 0 ? totalSaldo / totalTarjetas : 0,
      tarjetas_por_empresa: {}
    };

    // Agrupar por empresa
    tarjetas.forEach(tarjeta => {
      if (!estadisticas.tarjetas_por_empresa[tarjeta.empresa]) {
        estadisticas.tarjetas_por_empresa[tarjeta.empresa] = {
          cantidad: 0,
          saldo_total: 0
        };
      }
      estadisticas.tarjetas_por_empresa[tarjeta.empresa].cantidad++;
      estadisticas.tarjetas_por_empresa[tarjeta.empresa].saldo_total += parseFloat(tarjeta.saldo);
    });

    res.json(estadisticas);
  } catch (error) {
    console.error('Error al obtener estadísticas de transporte:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}; 