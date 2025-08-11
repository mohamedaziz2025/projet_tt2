const { sequelize } = require('./models');

async function migrateDatabase() {
  try {
    console.log('🔄 Démarrage de la migration de la base de données...');
    
    // Synchroniser tous les modèles avec la base de données
    await sequelize.sync({ alter: true });
    
    console.log('✅ Migration terminée avec succès');
    console.log('📊 Tables créées/mises à jour:');
    console.log('  - agences');
    console.log('  - services');
    console.log('  - tickets (mise à jour)');
    console.log('  - admins (existante)');
    
    // Créer quelques données d'exemple si les tables sont vides
    const { Agence, Service } = require('./models');
    
    const agenceCount = await Agence.count();
    if (agenceCount === 0) {
      console.log('🏢 Création d\'agences d\'exemple...');
      await Agence.bulkCreate([
        {
          nom: 'Agence Tunis Centre',
          code: 'TUN001',
          adresse: 'Avenue Habib Bourguiba, Tunis',
          ville: 'Tunis',
          codePostal: '1001',
          telephone: '+216 71 123 456',
          email: 'tunis.centre@tunisietelecom.tn',
          manager: 'Ahmed Ben Salem',
          capaciteMax: 100,
          statut: 'active'
        },
        {
          nom: 'Agence Sfax Nord',
          code: 'SFX001',
          adresse: 'Rue de la République, Sfax',
          ville: 'Sfax',
          codePostal: '3000',
          telephone: '+216 74 123 456',
          email: 'sfax.nord@tunisietelecom.tn',
          manager: 'Fatma Trabelsi',
          capaciteMax: 80,
          statut: 'active'
        },
        {
          nom: 'Agence Sousse Centre',
          code: 'SOU001',
          adresse: 'Avenue Léopold Sédar Senghor, Sousse',
          ville: 'Sousse',
          codePostal: '4000',
          telephone: '+216 73 123 456',
          email: 'sousse.centre@tunisietelecom.tn',
          manager: 'Mohamed Khiari',
          capaciteMax: 60,
          statut: 'active'
        }
      ]);
      console.log('✅ Agences d\'exemple créées');
    }
    
    const serviceCount = await Service.count();
    if (serviceCount === 0) {
      console.log('🔧 Création de services d\'exemple...');
      await Service.bulkCreate([
        {
          nom: 'Nouvelle ligne mobile',
          code: 'MOBILE001',
          description: 'Souscription à une nouvelle ligne mobile',
          icone: '📱',
          couleur: '#c41e3a',
          dureeEstimee: 20,
          priorite: 3,
          categorie: 'commercial'
        },
        {
          nom: 'Internet ADSL',
          code: 'ADSL001',
          description: 'Installation et configuration Internet ADSL',
          icone: '🌐',
          couleur: '#0066cc',
          dureeEstimee: 30,
          priorite: 2,
          categorie: 'technique'
        },
        {
          nom: 'Support technique',
          code: 'SUPPORT001',
          description: 'Assistance technique générale',
          icone: '🔧',
          couleur: '#28a745',
          dureeEstimee: 15,
          priorite: 4,
          categorie: 'support'
        },
        {
          nom: 'Paiement factures',
          code: 'PAY001',
          description: 'Paiement de factures Tunisie Télécom',
          icone: '💳',
          couleur: '#ffc107',
          dureeEstimee: 10,
          priorite: 5,
          categorie: 'administration'
        },
        {
          nom: 'Réclamations',
          code: 'RECL001',
          description: 'Dépôt et suivi de réclamations',
          icone: '📋',
          couleur: '#dc3545',
          dureeEstimee: 25,
          priorite: 1,
          categorie: 'support'
        }
      ]);
      console.log('✅ Services d\'exemple créés');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

migrateDatabase();
