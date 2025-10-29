import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { syncDatabase } from './config/database.js';

// Importar modelos
import Usuario from './models/Usuario.js';
import Transaccion from './models/Transaccion.js';
import Servicio from './models/Servicio.js';
import TarjetaTransporte from './models/TarjetaTransporte.js';
import Categoria from './models/Categoria.js';

// Importar middlewares
import { verifyToken } from './middlewares/Usuario.middleware.js';

// Placeholders for middlewares that may not be implemented yet
const requireAdmin = (req, res, next) => res.status(403).json({ success: false, message: 'requireAdmin middleware no implementado' });
const requireUser = (req, res, next) => next();

// Importar controladores
import { CrearCategoria, ObtenerCategorias, ActualizarCategoria, EliminarCategoria } from './controllers/Categoria.js';
import { CrearServicio, ObtenerServicios, ObtenerProveedores, CambiarServicioCelular, LimpiarServiciosCelulares, PagarServicio, PagarTodosLosServicios, EliminarServicio } from './controllers/Servicios.js';
import RegistroController from './controllers/Registro.js';
import UsuarioController from './controllers/Usuario.js';
const { Logearse, LoginGoogle, Profile, RecargarSaldo, ObtenerSaldo, ObtenerTransacciones, ObtenerGastosPorCategoria } = UsuarioController || {};
import TransferenciaController from './controllers/Transferencia.js';
const { TransferirDinero, BuscarUsuario, ObtenerActividades } = TransferenciaController || {};
import { RegistrarTarjeta, ObtenerTarjetas, RecargarTarjeta, EliminarTarjeta, ObtenerSaldoTarjeta, ObtenerEstadisticasTransporte, ReactivarTarjeta, ObtenerTarjetasDesactivadas, ObtenerEmpresasTransporte } from './controllers/Transporte.js';
import walletController from './controllers/wallet.js';

dotenv.config();

const app = express();
// Determinar puerto de la aplicación. Evitar usar el mismo puerto que la BD si fue exportado en PORT.
const rawPort = process.env.APP_PORT || process.env.PORT;
// Si no se pasa APP_PORT preferimos dejar que el SO asigne un puerto libre (0) para evitar EADDRINUSE
let PORT = process.env.APP_PORT || 3000;
if (rawPort && process.env.APP_PORT) {
  PORT = rawPort;
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ruta de prueba con timestamp
app.get('/', (req, res) => {
  res.json({
    message: '🚀 WALLET TIC SERVER - WITH SEQUELIZE - ' + new Date().toISOString(),
    timestamp: new Date().toISOString(),
    version: '6.0.0',
    status: 'ACTIVE',
    database: 'ENABLED',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: 'ENABLED'
  });
});

// Ruta para verificar variables de entorno
app.get('/env-check', (req, res) => {
  res.json({
    DB_HOST: process.env.DB_HOST ? '✅ Configurado' : '❌ Faltante',
    DB_USER: process.env.DB_USER ? '✅ Configurado' : '❌ Faltante',
    DB_PASSWORD: process.env.DB_PASSWORD ? '✅ Configurado' : '❌ Faltante',
    DB_NAME: process.env.DB_NAME ? '✅ Configurado' : '❌ Faltante',
    JWT_SECRET: process.env.JWT_SECRET ? '✅ Configurado' : '❌ Faltante',
    timestamp: new Date().toISOString()
  });
});

// Rutas de autenticación
const { AddUser, CrearAdmin } = RegistroController || {};
app.post("/auth/registro", AddUser);
app.post("/auth/login", Logearse);
app.post("/auth/google", LoginGoogle);

// Rutas protegidas
app.get("/profile", verifyToken, Profile);
app.post("/admin/crear", verifyToken, requireAdmin, (req, res, next) => {
  if (typeof CrearAdmin === 'function') return CrearAdmin(req, res, next);
  return res.status(501).json({ success: false, message: 'CrearAdmin no implementado' });
});

// Rutas de saldo y recargas
app.post("/saldo/recargar", verifyToken, (RecargarSaldo || ((req, res) => res.status(501).json({ success: false, message: 'RecargarSaldo no implementado' }))));
app.get("/saldo", verifyToken, ObtenerSaldo);

// Rutas de transacciones
app.get("/transacciones", verifyToken, ObtenerTransacciones);
app.get("/gastos/categoria", verifyToken, ObtenerGastosPorCategoria);

// Rutas de transferencias
app.post("/transferir", verifyToken, (TransferirDinero || ((req, res) => res.status(501).json({ success: false, message: 'TransferirDinero no implementado' }))));
app.get("/buscar-usuario", verifyToken, (BuscarUsuario || ((req, res) => res.status(501).json({ success: false, message: 'BuscarUsuario no implementado' }))));
app.get("/actividades", verifyToken, (ObtenerActividades || ((req, res) => res.status(501).json({ success: false, message: 'ObtenerActividades no implementado' }))));

// Rutas de servicios
app.get("/servicios/proveedores", ObtenerProveedores);
app.post("/servicios", verifyToken, CrearServicio);
app.put("/servicios/celular/cambiar", verifyToken, CambiarServicioCelular);
app.post("/servicios/celular/limpiar", verifyToken, LimpiarServiciosCelulares);
app.get("/servicios", verifyToken, ObtenerServicios);
app.post("/servicios/:servicio_id/pagar", verifyToken, PagarServicio);
app.post("/servicios/pagar-todos", verifyToken, PagarTodosLosServicios);
app.delete("/servicios/:servicio_id", verifyToken, EliminarServicio);

// Rutas de transporte
app.get("/transporte/empresas", ObtenerEmpresasTransporte);
app.post("/transporte/tarjetas", verifyToken, RegistrarTarjeta);
app.get("/transporte/tarjetas", verifyToken, ObtenerTarjetas);
app.get("/transporte/tarjetas/desactivadas", verifyToken, ObtenerTarjetasDesactivadas);
app.post("/transporte/recargar", verifyToken, RecargarTarjeta);
app.delete("/transporte/tarjetas/:tarjeta_id", verifyToken, EliminarTarjeta);
app.put("/transporte/tarjetas/:tarjeta_id/reactivar", verifyToken, ReactivarTarjeta);
app.get("/transporte/tarjetas/:tarjeta_id/saldo", verifyToken, ObtenerSaldoTarjeta);
app.get("/transporte/estadisticas", verifyToken, ObtenerEstadisticasTransporte);

// Rutas de categorías (solo admin)
app.post("/categorias", verifyToken, requireAdmin, CrearCategoria);
app.get("/categorias", verifyToken, ObtenerCategorias);
app.put("/categorias/:categoria_id", verifyToken, requireAdmin, ActualizarCategoria);
app.delete("/categorias/:categoria_id", verifyToken, requireAdmin, EliminarCategoria);

// Ruta de wallet
app.get("/wallet/estado", verifyToken, walletController.obtenerEstado);

// Middleware de manejo de errores
app.use((error, req, res, next) => {
  console.error('🚨 Error no manejado:', error);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// Middleware para capturar errores no manejados
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Inicializar servidor con base de datos
const startServer = async () => {
  try {
    console.log('🚀 Iniciando servidor con Sequelize...');
    console.log('📊 Variables de entorno:', {
      DB_HOST: process.env.DB_HOST ? '✅ Configurado' : '❌ Faltante',
      DB_USER: process.env.DB_USER ? '✅ Configurado' : '❌ Faltante',
      DB_PASSWORD: process.env.DB_PASSWORD ? '✅ Configurado' : '❌ Faltante',
      DB_NAME: process.env.DB_NAME ? '✅ Configurado' : '❌ Faltante',
      JWT_SECRET: process.env.JWT_SECRET ? '✅ Configurado' : '❌ Faltante'
    });

    // Sincronizar base de datos
    await syncDatabase();

    app.listen(PORT, () => {
      console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

startServer();

export default app;
