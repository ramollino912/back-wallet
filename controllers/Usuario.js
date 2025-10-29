
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import UsuarioModel from '../models/Usuario.js';
import Transaccion from '../models/Transaccion.js';
import Servicio from '../models/Servicio.js';
import TarjetaTransporte from '../models/TarjetaTransporte.js';
import { Op, fn, literal } from 'sequelize';

// import pool from '../dbconfig.js'; // Ya no se usa - migrado a Sequelize
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
    // El ID viene del token JWT verificado por el middleware
    const usuario = await UsuarioModel.findByPk(req.user.id, {
      attributes: ['id', 'nombre', 'apellido', 'email', 'saldo', 'created_at', 'updated_at']
    });
    
    if (!usuario) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }
    
    return res.status(200).json({ 
      success: true,
      data: usuario 
    });
  } catch (error) {
    console.error('Error en Profile:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al obtener el perfil del usuario',
      error: error.message 
    });
  }
};

export const Logearse = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email y contraseña son requeridos' 
      });
    }

    // Buscar usuario por email usando Sequelize
    const usuario = await UsuarioModel.findOne({ where: { email } });

    if (!usuario) {
      return res.status(404).json({ 
        success: false, 
        message: 'El email no está registrado' 
      });
    }

    // Verificar contraseña
    const passwordMatch = await usuario.comparePassword(password);

    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Contraseña incorrecta' 
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: usuario.id }, 
      process.env.SECRET || process.env.JWT_SECRET || 'tu_secreto', 
      { expiresIn: '1d' }
    );

    return res.status(200).json({ 
      success: true,
      message: 'Login exitoso', 
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        saldo: usuario.saldo,
        cvu: usuario.cvu,
        alias: usuario.alias
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error durante el inicio de sesión' 
    });
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
  try {
    const { monto } = req.body;
    const usuarioId = req.user.id;

    // Validar monto
    if (!monto || monto <= 0) {
      return res.status(400).json({ 
        success: false,
        error: 'El monto debe ser mayor a 0' 
      });
    }

    // Buscar usuario
    const usuario = await UsuarioModel.findByPk(usuarioId);

    if (!usuario) {
      return res.status(404).json({ 
        success: false,
        error: 'Usuario no encontrado' 
      });
    }

    const saldoAnterior = parseFloat(usuario.saldo);
    const nuevoSaldo = saldoAnterior + parseFloat(monto);

    // Actualizar saldo del usuario
    await usuario.update({ saldo: nuevoSaldo });

    // Registrar transacción
    await Transaccion.create({
      monto: parseFloat(monto),
      tipo: 'recarga_saldo',
      estado: 'completada',
      descripcion: 'Recarga de saldo',
      categoria: 'recarga',
      usuario_origen_id: usuarioId,
      saldo_anterior_origen: saldoAnterior,
      saldo_posterior_origen: nuevoSaldo
    });

    res.json({
      success: true,
      message: 'Saldo recargado exitosamente',
      saldoAnterior: saldoAnterior,
      montoRecargado: parseFloat(monto),
      nuevoSaldo: nuevoSaldo
    });
  } catch (error) {
    console.error('Error al recargar saldo:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Error al procesar la recarga',
      errorMessage: error.message,
      errorName: error.name
    });
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
      order: [['id', 'DESC']], // Cambiado de createdAt a id
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      transacciones: transacciones.rows,
      total: transacciones.count,
      totalPages: Math.ceil(transacciones.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor',
      message: error.message 
    });
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