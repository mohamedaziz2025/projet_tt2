const { sequelize } = require('./models');

async function checkDatabaseStructure() {
  try {
    console.log('🔍 Vérification de la structure de la base de données...');
    
    // Obtenir la liste des tables
    const [tables] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table';");
    console.log('📋 Tables trouvées:', tables.map(t => t.name));
    
    // Vérifier la structure de la table Tickets si elle existe
    if (tables.some(t => t.name === 'Tickets')) {
      console.log('\n📊 Structure de la table Tickets:');
      const [columns] = await sequelize.query("PRAGMA table_info(Tickets);");
      columns.forEach(col => {
        console.log(`- ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
      });
    }
    
    // Vérifier la structure de la table agences si elle existe
    if (tables.some(t => t.name === 'agences')) {
      console.log('\n🏢 Structure de la table agences:');
      const [columns] = await sequelize.query("PRAGMA table_info(agences);");
      columns.forEach(col => {
        console.log(`- ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
      });
    }
    
    // Vérifier la structure de la table services si elle existe
    if (tables.some(t => t.name === 'services')) {
      console.log('\n🔧 Structure de la table services:');
      const [columns] = await sequelize.query("PRAGMA table_info(services);");
      columns.forEach(col => {
        console.log(`- ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkDatabaseStructure();
