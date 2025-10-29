/* import pool from "../dbconfig.js";
import bcrypt from "bcryptjs"
import Usuario from "./Usuario.js";


const AddUser = async (req, res) => {
  const { nombre, apellido, mail, contrasena, direccion, dni} = req.body;
  try {
    const queryUsuario = `
      SELECT * FROM perfil WHERE dni = $1
    `;
    const resultadodni = await pool.query(queryUsuario, [dni]);

    const queryMail = `
      SELECT * FROM perfil WHERE mail = $1
    `;
    const resultadomail = await pool.query(queryMail, [mail]);

    if (resultadomail.rows.length > 0)
      return res.status(400).json({ success: false, message: 'Ya existe un usuario con ese mail.' });
    if (resultadodni.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Ya existe un usuario con ese DNI. Por favor fijate que este bien.' });
    } else {
      // Hashear la contraseña antes de guardarla
      const hashedPassword = await bcrypt.hash(contrasena, 10);

      const queryRegistro = `
        INSERT INTO perfil (nombre, apellido, mail, contrasena, direccion, dni)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
      `;
      const result = await pool.query(queryRegistro, [nombre, apellido, mail, hashedPassword, direccion, dni]);//usuario

      return res.status(201).json({message: 'Usuario registrado correctamente', user: result.rows[0] });
    }
<<<<<<< HEAD

    // Verificar si el email ya existe
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Funciones para generar CVU y alias únicos
    const generateCVU = () => {
      return '00000031000' + Math.random().toString().slice(2, 22);
    };

    const generateAlias = () => {
      const palabras = ['wallet', 'dinero', 'pago', 'transfer', 'cash', 'money', 'bank'];
      const palabra = palabras[Math.floor(Math.random() * palabras.length)];
      const numero = Math.floor(Math.random() * 999) + 1;
      return `${palabra}.${numero}`;
    };

    // Crear nuevo usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      apellido,
      email,
      password,
      cvu: generateCVU(),
      alias: generateAlias(),
      tipo_usuario: 'usuario' // Por defecto es usuario normal
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        email: nuevoUsuario.email,
        saldo: nuevoUsuario.saldo,
        cvu: nuevoUsuario.cvu,
        alias: nuevoUsuario.alias,
        tipo_usuario: nuevoUsuario.tipo_usuario
      }
    });
=======
>>>>>>> parent of a7e1c5e (cambiar el proyecto a sequelize, hacer todas las funcionalidades desde cero, ya sea impuestos, compañias telefonicas, o transporte. Ademas puli todo lo que estaba a mediohacer)
  } catch (error) {
    console.error(error);
    return res.status(500).json({message: 'Error al registrar el usuario.' });
  }
};

const Registro = {
    AddUser
};
export default Registro; */

import UsuarioModel from '../models/Usuario.js';

const AddUser = async (req, res) => {
  try {
    const { nombre, apellido, email, password } = req.body;

    // Validar campos requeridos
    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todos los campos son requeridos (nombre, apellido, email, password)' 
      });
    }

    // Verificar si el email ya existe
    const usuarioExistente = await UsuarioModel.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ya existe un usuario con ese email' 
      });
    }

    // Crear nuevo usuario (el modelo se encarga de hashear password y generar CVU/alias)
    const nuevoUsuario = await UsuarioModel.create({
      nombre,
      apellido,
      email,
      password,
      tipo_usuario: 'usuario'
    });

    // Responder con datos del usuario (sin password)
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        email: nuevoUsuario.email,
        saldo: nuevoUsuario.saldo,
        cvu: nuevoUsuario.cvu,
        alias: nuevoUsuario.alias,
        tipo_usuario: nuevoUsuario.tipo_usuario
      }
    });
  } catch (error) {
    console.error('Error en el registro:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    // Manejo específico de errores de validación de Sequelize
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Error de validación: ' + error.errors.map(e => e.message).join(', ') 
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        success: false, 
        message: 'El email ya está registrado' 
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: 'Error al registrar el usuario',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Crear admin (opcional, solo para admins)
const CrearAdmin = async (req, res) => {
  try {
    const { nombre, apellido, email, password } = req.body;

    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todos los campos son requeridos' 
      });
    }

    const usuarioExistente = await UsuarioModel.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ya existe un usuario con ese email' 
      });
    }

    const nuevoAdmin = await UsuarioModel.create({
      nombre,
      apellido,
      email,
      password,
      tipo_usuario: 'admin'
    });

    res.status(201).json({
      success: true,
      message: 'Administrador creado exitosamente',
      usuario: {
        id: nuevoAdmin.id,
        nombre: nuevoAdmin.nombre,
        apellido: nuevoAdmin.apellido,
        email: nuevoAdmin.email,
        tipo_usuario: nuevoAdmin.tipo_usuario
      }
    });
  } catch (error) {
    console.error('Error al crear admin:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al crear administrador' 
    });
  }
};

const Registro = { 
  AddUser,
  CrearAdmin
};

export default Registro;
