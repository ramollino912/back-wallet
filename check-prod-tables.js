import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_URL);

async function checkTables() {
  try {
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('✅ Tablas en producción:');
    results.forEach(r => console.log('  -', r.table_name));
    
    // Verificar columnas de servicios
    const [serviciosColumns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'servicios' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Columnas de tabla servicios:');
    serviciosColumns.forEach(c => console.log('  -', c.column_name));
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTables();
