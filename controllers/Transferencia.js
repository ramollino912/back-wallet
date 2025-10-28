import pool from "../dbconfig.js";

/*
    Controladores de transferencia
*/

const filtro = async (req, res) => {
    try {
        const { Check } = req.body;
        const filtrar = 'SELECT * FROM perfil WHERE mail ILIKE $1 OR dni ILIKE $1 OR nombre ILIKE $1 OR apellido ILIKE $1';
        const resultadoFiltro = await pool.query(filtrar, [Check]);

        if (resultadoFiltro.rows.length === 0) {
            return res.status(404).json({ success: false, message: "No se encontró la cuenta" });
        }

        return res.status(200).json({ success: true, results: resultadoFiltro.rows });
    } catch (error) {
        console.error('Error en filtro Transferencia:', error);
        return res.status(500).json({ success: false, message: "Error en el servidor" });
    }
};

const TransferirDinero = async (req, res) => {
  const { destinatarioId, monto, descripcion } = req.body;
  const origenId = req.user.id;

  if (!destinatarioId || !monto || monto <= 0) {
    return res.status(400).json({ error: 'Datos de transferencia inválidos' });
  }

  try {
    await pool.query('BEGIN');

    // Verificar saldo del origen
    const origenResult = await pool.query(
      'SELECT saldo FROM cuentas WHERE user_id = $1',
      [origenId]
    );

    if (origenResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Cuenta origen no encontrada' });
    }

    const saldoOrigen = parseFloat(origenResult.rows[0].saldo);
    if (saldoOrigen < monto) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    // Verificar cuenta destino
    const destinoResult = await pool.query(
      'SELECT saldo FROM cuentas WHERE user_id = $1',
      [destinatarioId]
    );

    if (destinoResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Cuenta destino no encontrada' });
    }

    // Actualizar saldos
    await pool.query(
      'UPDATE cuentas SET saldo = saldo - $1 WHERE user_id = $2',
      [monto, origenId]
    );

    await pool.query(
      'UPDATE cuentas SET saldo = saldo + $1 WHERE user_id = $2',
      [monto, destinatarioId]
    );

    // Registrar transacción
    await pool.query(
      'INSERT INTO transacciones (usuario_origen_id, usuario_destino_id, tipo, monto, descripcion) VALUES ($1, $2, $3, $4, $5)',
      [origenId, destinatarioId, 'transferencia', monto, descripcion || 'Transferencia']
    );

    await pool.query('COMMIT');

    res.json({
      message: 'Transferencia realizada exitosamente',
      monto,
      descripcion
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error en transferencia:', error);
    res.status(500).json({ error: 'Error al procesar la transferencia' });
  }
};

const BuscarUsuario = async (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Término de búsqueda requerido' });
  }

  try {
    const result = await pool.query(
      'SELECT id, nombre, apellido, email FROM usuarios WHERE nombre ILIKE $1 OR apellido ILIKE $1 OR email ILIKE $1',
      [`%${query}%`]
    );

    res.json({ usuarios: result.rows });
  } catch (error) {
    console.error('Error al buscar usuarios:', error);
    res.status(500).json({ error: 'Error en la búsqueda' });
  }
};

const ObtenerActividades = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const usuarioId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT t.*, 
        u1.nombre as origen_nombre, u1.apellido as origen_apellido, u1.email as origen_email,
        u2.nombre as destino_nombre, u2.apellido as destino_apellido, u2.email as destino_email
      FROM transacciones t
      LEFT JOIN usuarios u1 ON t.usuario_origen_id = u1.id
      LEFT JOIN usuarios u2 ON t.usuario_destino_id = u2.id
      WHERE t.usuario_origen_id = $1 OR t.usuario_destino_id = $1
      ORDER BY t.created_at DESC
      LIMIT $2 OFFSET $3`,
      [usuarioId, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM transacciones WHERE usuario_origen_id = $1 OR usuario_destino_id = $1',
      [usuarioId]
    );

    const actividades = result.rows.map(act => ({
      id: act.id,
      tipo: act.tipo,
      monto: act.monto,
      descripcion: act.descripcion,
      fecha: act.created_at,
      esEnvio: act.usuario_origen_id === usuarioId,
      origen: {
        nombre: act.origen_nombre,
        apellido: act.origen_apellido,
        email: act.origen_email
      },
      destino: {
        nombre: act.destino_nombre,
        apellido: act.destino_apellido,
        email: act.destino_email
      }
    }));

    res.json({
      actividades,
      total: parseInt(countResult.rows[0].count),
      pagina: parseInt(page),
      totalPaginas: Math.ceil(parseInt(countResult.rows[0].count) / limit)
    });
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    res.status(500).json({ error: 'Error al obtener actividades' });
  }
};const Transferencias = {
  filtro,
  TransferirDinero,
  BuscarUsuario,
  ObtenerActividades
};

export default Transferencias;
