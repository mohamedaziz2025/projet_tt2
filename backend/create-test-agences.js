const { Agence } = require('./models');

async function creerAgencesTest() {
  try {
    console.log('🏢 Création d\'agences de test...');

    // Compter les agences existantes
    const count = await Agence.count();
    console.log(`📊 Agences existantes: ${count}`);

    if (count > 0) {
      console.log('ℹ️ Des agences existent déjà, pas de création');
      return;
    }

    const agencesTest = [
      {
        nom: 'Agence Tunis Centre',
        code: 'TUN001',
        adresse: '10 Avenue Habib Bourguiba',
        ville: 'Tunis',
        codePostal: '1000',
        telephone: '+216 71 123 456',
        email: 'tunis.centre@tunisietelecom.tn',
        manager: 'Ahmed Ben Salem',
        capaciteMax: 100,
        statut: 'active',
        heuresOuverture: {
          lundi: { ouvert: true, debut: '08:00', fin: '17:00' },
          mardi: { ouvert: true, debut: '08:00', fin: '17:00' },
          mercredi: { ouvert: true, debut: '08:00', fin: '17:00' },
          jeudi: { ouvert: true, debut: '08:00', fin: '17:00' },
          vendredi: { ouvert: true, debut: '08:00', fin: '17:00' },
          samedi: { ouvert: true, debut: '08:00', fin: '12:00' },
          dimanche: { ouvert: false, debut: '08:00', fin: '17:00' }
        }
      },
      {
        nom: 'Agence Sfax Nord',
        code: 'SFX001',
        adresse: '25 Rue Ali Bach Hamba',
        ville: 'Sfax',
        codePostal: '3000',
        telephone: '+216 74 456 789',
        email: 'sfax.nord@tunisietelecom.tn',
        manager: 'Fatma Trabelsi',
        capaciteMax: 80,
        statut: 'active',
        heuresOuverture: {
          lundi: { ouvert: true, debut: '07:30', fin: '16:30' },
          mardi: { ouvert: true, debut: '07:30', fin: '16:30' },
          mercredi: { ouvert: true, debut: '07:30', fin: '16:30' },
          jeudi: { ouvert: true, debut: '07:30', fin: '16:30' },
          vendredi: { ouvert: true, debut: '07:30', fin: '16:30' },
          samedi: { ouvert: true, debut: '08:00', fin: '12:00' },
          dimanche: { ouvert: false, debut: '08:00', fin: '16:30' }
        }
      },
      {
        nom: 'Agence Sousse Centre',
        code: 'SOU001',
        adresse: '15 Boulevard de la République',
        ville: 'Sousse',
        codePostal: '4000',
        telephone: '+216 73 789 123',
        email: 'sousse.centre@tunisietelecom.tn',
        manager: 'Mohamed Gharbi',
        capaciteMax: 60,
        statut: 'active',
        heuresOuverture: {
          lundi: { ouvert: true, debut: '08:00', fin: '17:00' },
          mardi: { ouvert: true, debut: '08:00', fin: '17:00' },
          mercredi: { ouvert: true, debut: '08:00', fin: '17:00' },
          jeudi: { ouvert: true, debut: '08:00', fin: '17:00' },
          vendredi: { ouvert: true, debut: '08:00', fin: '17:00' },
          samedi: { ouvert: true, debut: '09:00', fin: '13:00' },
          dimanche: { ouvert: false, debut: '08:00', fin: '17:00' }
        }
      },
      {
        nom: 'Agence Ariana',
        code: 'ARI001',
        adresse: '5 Avenue de l\'Indépendance',
        ville: 'Ariana',
        codePostal: '2080',
        telephone: '+216 71 234 567',
        email: 'ariana@tunisietelecom.tn',
        manager: 'Leila Karoui',
        capaciteMax: 50,
        statut: 'active',
        heuresOuverture: {
          lundi: { ouvert: true, debut: '08:30', fin: '17:30' },
          mardi: { ouvert: true, debut: '08:30', fin: '17:30' },
          mercredi: { ouvert: true, debut: '08:30', fin: '17:30' },
          jeudi: { ouvert: true, debut: '08:30', fin: '17:30' },
          vendredi: { ouvert: true, debut: '08:30', fin: '17:30' },
          samedi: { ouvert: true, debut: '08:30', fin: '12:30' },
          dimanche: { ouvert: false, debut: '08:30', fin: '17:30' }
        }
      }
    ];

    // Créer les agences
    for (const agenceData of agencesTest) {
      const agence = await Agence.create(agenceData);
      console.log(`✅ Agence créée: ${agence.nom} (${agence.code})`);
    }

    console.log('🎉 Agences de test créées avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors de la création des agences:', error);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  creerAgencesTest().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Erreur:', error);
    process.exit(1);
  });
}

module.exports = { creerAgencesTest };
