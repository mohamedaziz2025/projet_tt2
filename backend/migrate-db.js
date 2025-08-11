require('dotenv').config();
console.log('🔧 Migration de la base de données...');

const { sequelize, Agence, Service, Ticket, Admin } = require('./models');

async function migrateDatabese() {
  try {
    console.log('🔌 Connexion à la base de données...');
    await sequelize.authenticate();
    console.log('✅ Connexion réussie');

    console.log('🗃️ Synchronisation des modèles...');
    // Force: true pour recréer les tables
    await sequelize.sync({ force: true });
    console.log('✅ Tables synchronisées');

    console.log('🌱 Insertion des données de base...');
    
    // Créer des agences de test
    const agences = await Agence.bulkCreate([
      {
        nom: 'Tunisie Telecom Tunis Centre',
        code: 'TT_TNC',
        adresse: 'Avenue Habib Bourguiba',
        ville: 'Tunis',
        codePostal: '1001',
        telephone: '71000000',
        email: 'tunis.centre@tt.tn',
        manager: 'Ahmed Ben Salah',
        capaciteMax: 100,
        statut: 'active'
      },
      {
        nom: 'Tunisie Telecom Sfax',
        code: 'TT_SFX',
        adresse: 'Avenue de la République',
        ville: 'Sfax',
        codePostal: '3000',
        telephone: '74000000',
        email: 'sfax@tt.tn',
        manager: 'Fatma Trabelsi',
        capaciteMax: 80,
        statut: 'active'
      },
      {
        nom: 'Tunisie Telecom Sousse',
        code: 'TT_SOU',
        adresse: 'Avenue Bourguiba',
        ville: 'Sousse',
        codePostal: '4000',
        telephone: '73000000',
        email: 'sousse@tt.tn',
        manager: 'Mohamed Jemni',
        capaciteMax: 60,
        statut: 'active'
      }
    ]);
    console.log(`✅ ${agences.length} agences créées`);

    // Créer des services
    const services = await Service.bulkCreate([
      {
        nom: 'Abonnement Internet',
        code: 'INTERNET',
        description: 'Souscription et gestion des abonnements Internet',
        icone: '🌐',
        couleur: '#007bff',
        dureeEstimee: 20,
        priorite: 1,
        categorie: 'commercial'
      },
      {
        nom: 'Support Technique',
        code: 'SUPPORT',
        description: 'Assistance technique et dépannage',
        icone: '🔧',
        couleur: '#28a745',
        dureeEstimee: 15,
        priorite: 2,
        categorie: 'technique'
      },
      {
        nom: 'Facturation',
        code: 'FACTURE',
        description: 'Questions relatives à la facturation',
        icone: '💰',
        couleur: '#ffc107',
        dureeEstimee: 10,
        priorite: 3,
        categorie: 'commercial'
      },
      {
        nom: 'Réclamations',
        code: 'RECLAIM',
        description: 'Dépôt et suivi des réclamations',
        icone: '📝',
        couleur: '#dc3545',
        dureeEstimee: 25,
        priorite: 1,
        categorie: 'support'
      },
      {
        nom: 'Services Entreprise',
        code: 'ENTREPRISE',
        description: 'Services dédiés aux entreprises',
        icone: '🏢',
        couleur: '#6f42c1',
        dureeEstimee: 30,
        priorite: 2,
        categorie: 'commercial'
      }
    ]);
    console.log(`✅ ${services.length} services créés`);

    // Créer l'admin par défaut
    const admin = await Admin.create({
      email: process.env.ADMIN_EMAIL || 'admin@tunisietelecom.tn',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      nom: 'Administrateur',
      prenom: 'Système',
      role: 'admin'
    });
    console.log('✅ Admin créé:', admin.email);

    console.log('🎉 Migration terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

migrateDatabese()
  .then(() => {
    console.log('✨ Base de données prête!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
