
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import UsuarioModel from '../models/Usuario.js';
import Transaccion from '../models/Transaccion.js';
import Servicio from '../models/Servicio.js';
import TarjetaTransporte from '../models/TarjetaTransporte.js';
import { Op, fn, literal } from 'sequelize';

import pool from '../dbconfig.js';
import bcrypt from 'bcryptjs';

/*const Logearse = async(req ,res)=> {
    try{ 
        const hashedPassword = await bcrypt.hash(req.body.contrasena, 10);
        const Usuario = await pool.query(
            'SELECT mail, contrasena FROM perfil WHERE mail  = $1',
            [req.body.mail]
        );
        if (Usuario.rows.length == 1) {
            if (await bcrypt.compare(req.body.contrasena, Usuario.rows[0].contrasena))
            {
                const token = jwt.sign({ id: Usuario.rows[0].id }, "tu_secreto"/*process.env.SECRET, {
                    expiresIn: "1d",
                    });
                return res.status(200).json({ message: 'Se logeo correctamente.', token });
            }
                
            else 
                return res.status(500).json({ success: false, message: 'La contraseña o el mail son incorrecto11'});
        } else  
            return res.status(500).json({ success: false, message: 'La contraseña o el mail son incorrecto2' });
    }   catch (e) {
        console.log(e);
        res.status(500).json('La contraseña o el usuario no son correctos');
    }
    if(!Usuario){
        return res.status(400).send({status:"Error", message: "Error durante el login"})
    }
};*/

const OlvidasteContra = async (req, res) => {
    const { mail } = req.body;
    try {
        // Verificar si el email existe
        const MailCheck = await pool.query('SELECT * FROM perfil WHERE mail = $1', [mail]);

        if (MailCheck.rows.length === 0) {
            return res.status(404).json({ message: 'El correo electrónico no está registrado.' });
        }
    }catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al enviar el correo de restablecimiento de contraseña.' });
    }
};


// Controladores de usuario

// Cliente de Google (crear instancia cuando se use)
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const LoginGoogle = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: google_id } = payload;

    let usuario = await UsuarioModel.findOne({ where: { email } });

    if (!usuario) {
      // Funciones para generar CVU y alias únicos
      const generateCVU = () => '00000031000' + Math.random().toString().slice(2, 22);

      const generateAlias = () => {
        const palabras = ['wallet', 'dinero', 'pago', 'transfer', 'cash', 'money', 'bank'];
        const palabra = palabras[Math.floor(Math.random() * palabras.length)];
        const numero = Math.floor(Math.random() * 999) + 1;
        return `${palabra}.${numero}`;
      };

      const [nombre, apellido] = (name || '').split(' ');
      usuario = await UsuarioModel.create({
        nombre: nombre || name,
        apellido: apellido || '',
        email,
        password: Math.random().toString(36).slice(-8), // Contraseña temporal
        cvu: generateCVU(),
        alias: generateAlias(),
        google_id,
        avatar: picture
      });
    } else if (!usuario.google_id) {
      usuario.google_id = google_id;
      usuario.avatar = picture;
      await usuario.save();
    }

    // Generar token JWT
    const tokenJwt = jwt.sign({ id: usuario.id }, process.env.SECRET || 'tu_secreto', { expiresIn: '1d' });
    res.status(200).json({ usuario, token: tokenJwt });
  } catch (error) {
    console.error('LoginGoogle error:', error);
    res.status(500).json({ message: 'Error en autenticación con Google' });
  }
};

export const Profile = async (req, res) => {
  try {
    const query = 'SELECT id, nombre, apellido, mail, direccion, dni FROM perfil WHERE id = $1';
    const result = await pool.query(query, [req.params.id]);
    if (result.rows.length > 0) {
      return res.status(200).json({ data: result.rows[0] });
    } else {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error al obtener el perfil del usuario' });
  }
};

export const Logearse = async (req, res) => {
  try {
    if (!req.body.mail || !req.body.contrasena) {
      return res.status(400).json({ message: 'Correo electrónico y contraseña son requeridos.' });
    }

    const UsuarioQuery = await pool.query('SELECT id, mail, contrasena FROM perfil WHERE mail = $1', [req.body.mail]);

    if (UsuarioQuery.rows.length === 1) {
      const passwordMatch = await bcrypt.compare(req.body.contrasena, UsuarioQuery.rows[0].contrasena);

      if (passwordMatch) {
        const token = jwt.sign({ id: UsuarioQuery.rows[0].id }, process.env.SECRET || 'tu_secreto', { expiresIn: '1d' });
        return res.status(200).json({ message: 'Se logeó correctamente.', token });
      }
      return res.status(401).json({ success: false, message: 'La contraseña o el correo electrónico son incorrectos.' });
    }

    return res.status(404).json({ success: false, message: 'El correo electrónico no está registrado.' });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Error durante el inicio de sesión.' });
  }
};

export const ObtenerSaldo = async (req, res) => {
  try {
    const usuario = await UsuarioModel.findByPk(req.user.id);
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ saldo: usuario.saldo });
  } catch (error) {
    console.error('Error al obtener saldo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const RecargarSaldo = async (req, res) => {
  const { monto } = req.body;
  const usuarioId = req.user.id;

  if (!monto || monto <= 0) {
    return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
  }

  try {
    // Iniciar transacción
    await pool.query('BEGIN');

    // Obtener saldo actual
    const result = await pool.query(
      'SELECT saldo FROM cuentas WHERE user_id = $1',
      [usuarioId]
    );

    if (result.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    const saldoActual = parseFloat(result.rows[0].saldo);
    const nuevoSaldo = saldoActual + parseFloat(monto);

    // Actualizar saldo
    await pool.query(
      'UPDATE cuentas SET saldo = $1 WHERE user_id = $2',
      [nuevoSaldo, usuarioId]
    );

    // Registrar transacción
    await pool.query(
      'INSERT INTO transacciones (usuario_origen_id, tipo, monto, descripcion) VALUES ($1, $2, $3, $4)',
      [usuarioId, 'recarga_saldo', monto, 'Recarga de saldo']
    );

    await pool.query('COMMIT');

    res.json({
      message: 'Saldo recargado exitosamente',
      nuevoSaldo
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error al recargar saldo:', error);
    res.status(500).json({ error: 'Error al procesar la recarga' });
  }
};export const ObtenerTransacciones = async (req, res) => {
  try {
    const { page = 1, limit = 10, categoria } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      [Op.or]: [{ usuario_origen_id: req.user.id }, { usuario_destino_id: req.user.id }]
    };

    if (categoria) whereClause.categoria = categoria;

    const transacciones = await Transaccion.findAndCountAll({
      where: whereClause,
      include: [
        { model: UsuarioModel, as: 'usuario_origen', attributes: ['nombre', 'apellido', 'email'] },
        { model: UsuarioModel, as: 'usuario_destino', attributes: ['nombre', 'apellido', 'email'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      transacciones: transacciones.rows,
      total: transacciones.count,
      totalPages: Math.ceil(transacciones.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const ObtenerGastosPorCategoria = async (req, res) => {
  try {
    const { mes, año } = req.query;
    const usuarioId = req.user.id;

    const whereClause = {
      usuario_origen_id: usuarioId,
      tipo: { [Op.ne]: 'recarga_saldo' }
    };

    if (mes && año) {
      whereClause.createdAt = {
        [Op.between]: [new Date(año, mes - 1, 1), new Date(año, mes, 0, 23, 59, 59)]
      };
    }

    const gastos = await Transaccion.findAll({
      where: whereClause,
      attributes: ['categoria', [fn('SUM', literal('CAST(monto AS DECIMAL)')), 'total']],
      group: ['categoria'],
      raw: true
    });

    res.json({ gastos });
  } catch (error) {
    console.error('Error al obtener gastos por categoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const Usuario = {
  Logearse,
  Profile,
  LoginGoogle,
  OlvidasteContra,
  ObtenerSaldo,
  ObtenerTransacciones,
  ObtenerGastosPorCategoria,
  RecargarSaldo
};

export default Usuario;