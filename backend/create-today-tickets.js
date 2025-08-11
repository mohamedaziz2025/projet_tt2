const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erreur connexion DB:', err.message);
    return;
  }
  console.log('✅ Connecté à la base de données SQLite');
});

async function createTodayTickets() {
  console.log('🎫 Création de tickets pour aujourd\'hui');
  
  const now = new Date().toISOString();
  const heureArrivee = new Date().toTimeString().split(' ')[0];
  
  const tickets = [
    {
      agence: 'Tunis Centre',
      service: 'Abonnement Internet',
      email: 'client1@test.com',
      status: 'en_attente'
    },
    {
      agence: 'Sfax',
      service: 'Support Technique', 
      email: 'client2@test.com',
      status: 'en_attente'
    },
    {
      agence: 'Sousse',
      service: 'Facturation',
      email: 'client3@test.com',
      status: 'en_cours'
    },
    {
      agence: 'Tunis Centre',
      service: 'Réclamations',
      email: 'client4@test.com',
      status: 'en_cours'
    },
    {
      agence: 'Ariana',
      service: 'Services Entreprise',
      email: 'client5@test.com',
      status: 'termine'
    }
  ];
  
  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i];
    const ticketTime = new Date();
    ticketTime.setMinutes(ticketTime.getMinutes() - (i * 15)); // Échelonner les heures
    
    const sql = `
      INSERT INTO Tickets (agence, service, email, status, heure_arrivee, estimation_minutes, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      ticket.agence,
      ticket.service,
      ticket.email,
      ticket.status,
      ticketTime.toTimeString().split(' ')[0],
      15 + (i * 5), // Estimation variable
      ticketTime.toISOString(),
      ticketTime.toISOString()
    ];
    
    await new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) {
          console.error(`❌ Erreur ticket ${i+1}:`, err.message);
          reject(err);
        } else {
          console.log(`✅ Ticket #${this.lastID} créé: ${ticket.agence} - ${ticket.service} (${ticket.status})`);
          resolve();
        }
      });
    });
    
    // Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Vérifier les résultats
  console.log('\n🔍 Vérification...');
  const today = new Date().toISOString().split('T')[0];
  
  await new Promise((resolve) => {
    db.all(`
      SELECT COUNT(*) as count 
      FROM Tickets 
      WHERE DATE(createdAt) = ?
    `, [today], (err, rows) => {
      if (err) {
        console.error('❌ Erreur vérification:', err.message);
      } else {
        console.log(`📊 Tickets créés aujourd'hui: ${rows[0].count}`);
      }
      resolve();
    });
  });
  
  await new Promise((resolve) => {
    db.all(`
      SELECT status, COUNT(*) as count 
      FROM Tickets 
      WHERE DATE(createdAt) = ?
      GROUP BY status
    `, [today], (err, rows) => {
      if (err) {
        console.error('❌ Erreur stats:', err.message);
      } else {
        console.log('📈 Répartition par statut:');
        rows.forEach(row => {
          console.log(`   ${row.status}: ${row.count}`);
        });
      }
      resolve();
    });
  });
  
  db.close((err) => {
    if (err) {
      console.error('❌ Erreur fermeture:', err.message);
    } else {
      console.log('\n✅ Base de données fermée');
    }
  });
}

if (require.main === module) {
  createTodayTickets();
}

module.exports = { createTodayTickets };
