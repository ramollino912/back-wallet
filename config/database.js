import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Configuración para Vercel usando wallet
const sequelize = new Sequelize(
  process.env.DB_NAME || 'wallet',
  process.env.DB_USER || 'default',
  process.env.DB_PASSWORD || '1U0hcQmxMuTz',
  {
    host: process.env.DB_HOST || 'ep-white-dust-a4ao0h56.us-east-1.aws.neon.tech',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

export const syncDatabase = async () => {
  let retries = 3;

  while (retries > 0) {
    try {
      await sequelize.authenticate();
      console.log('✅ Conexión a la base de datos establecida correctamente.');
      // No usar sync() ya que las tablas son manejadas por migraciones
      // await sequelize.sync();
      console.log('✅ Conexión establecida. Tablas manejadas por migraciones.');
      return;
    } catch (error) {
      retries--;
      console.error(`❌ Error al conectar a la base de datos (intentos restantes: ${retries}):`, error.message);

      if (retries === 0) {
        console.error('❌ Error final al conectar a la base de datos:', error);
        if (process.env.NODE_ENV === 'production') {
          console.error('⚠️ Error en producción, continuando sin base de datos');
          return;
        }
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

export default sequelize; 