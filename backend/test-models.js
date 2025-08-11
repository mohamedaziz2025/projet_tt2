console.log('🚀 Démarrage du test...');

try {
  console.log('📦 Test des modèles...');
  const models = require('./models');
  console.log('✅ Modèles chargés:', Object.keys(models));
  
  console.log('🔗 Test de connexion à la base de données...');
  models.sequelize.authenticate()
    .then(() => {
      console.log('✅ Connexion à la base de données réussie');
      
      console.log('📋 Test des routes...');
      const express = require('express');
      const app = express();
      
      app.get('/test', (req, res) => {
        res.json({ message: 'Test réussi!' });
      });
      
      const port = 5001; // Port différent pour éviter les conflits
      app.listen(port, () => {
        console.log(`✅ Serveur de test démarré sur le port ${port}`);
        process.exit(0);
      });
    })
    .catch(err => {
      console.error('❌ Erreur de connexion à la base de données:', err);
      process.exit(1);
    });
    
} catch (error) {
  console.error('❌ Erreur lors du chargement des modèles:', error);
  process.exit(1);
}
