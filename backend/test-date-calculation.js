// Test de calcul de date pour debug
const now = new Date();
console.log('Date actuelle:', now.toISOString());

// Ancien calcul (problématique)
const today1 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const tomorrow1 = new Date(today1);
tomorrow1.setDate(tomorrow1.getDate() + 1);
console.log('Ancien calcul:');
console.log('  Aujourd\'hui:', today1.toISOString());
console.log('  Demain:', tomorrow1.toISOString());

// Nouveau calcul (corrigé) - utiliser setHours pour bien définir 00:00 et 24:00
const today2 = new Date();
today2.setHours(0, 0, 0, 0);
const tomorrow2 = new Date(today2);
tomorrow2.setHours(24, 0, 0, 0); // 24h = début du jour suivant
console.log('Nouveau calcul:');
console.log('  Aujourd\'hui:', today2.toISOString());
console.log('  Demain:', tomorrow2.toISOString());

// Test avec des tickets de test
const testTickets = [
  '2025-08-11T07:26:32.582Z',
  '2025-08-11T07:11:32.897Z',
  '2025-08-11T06:56:34.060Z'
];

testTickets.forEach(ticketDate => {
  const date = new Date(ticketDate);
  const isInRange1 = date >= today1 && date < tomorrow1;
  const isInRange2 = date >= today2 && date < tomorrow2;
  console.log(`Ticket ${ticketDate}: ancien=${isInRange1}, nouveau=${isInRange2}`);
});
