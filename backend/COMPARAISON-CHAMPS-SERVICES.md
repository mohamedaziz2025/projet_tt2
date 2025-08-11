🔍 COMPARAISON DÉTAILLÉE - CHAMPS SERVICES FRONTEND vs BASE DE DONNÉES

=================================================================
ANALYSE COMPLÈTE DES CHAMPS
=================================================================

📋 STRUCTURE BASE DE DONNÉES (MySQL table 'services'):
┌────────────────┬─────────────────┬─────────────────────────────┐
│ CHAMP DB       │ TYPE           │ STATUT                      │
├────────────────┼─────────────────┼─────────────────────────────┤
│ id             │ int(11)        │ ✅ PRIMARY KEY (auto)       │
│ nom            │ varchar(100)   │ ✅ REQUIRED                 │
│ description    │ text           │ ⚠️  NULLABLE                │
│ duree_moyenne  │ int(11)        │ ⚠️  NULLABLE (défaut: null) │
│ active         │ tinyint(1)     │ ⚠️  NULLABLE (défaut: null) │
│ created_at     │ timestamp      │ ✅ REQUIRED (auto)          │
│ updated_at     │ timestamp      │ ✅ REQUIRED (auto)          │
└────────────────┴─────────────────┴─────────────────────────────┘

📋 STRUCTURE FRONTEND (ServiceManager.jsx formData):
┌─────────────────────────┬─────────────────┬────────────────────────────┐
│ CHAMP FRONTEND          │ TYPE JS         │ CORRESPONDANCE DB          │
├─────────────────────────┼─────────────────┼────────────────────────────┤
│ nom                     │ string          │ ✅ → nom (MATCH EXACT)     │
│ description             │ string          │ ✅ → description (MATCH)   │
│ icon                    │ string          │ ❌ → PAS EN DB             │
│ couleur                 │ string          │ ❌ → PAS EN DB             │
│ dureeEstimee           │ number          │ ⚠️  → duree_moyenne (DIFF)  │
│ priority                │ number          │ ❌ → PAS EN DB             │
│ status                  │ string          │ ⚠️  → active (CONVERSION)  │
│ prerequis               │ string          │ ❌ → PAS EN DB             │
│ documentsNecessaires    │ string          │ ❌ → PAS EN DB             │
└─────────────────────────┴─────────────────┴────────────────────────────┘

=================================================================
PROBLÈMES IDENTIFIÉS
=================================================================

🚨 CHAMPS MANQUANTS EN DB:
├─ icon (icônes du service)
├─ couleur (couleur du thème)  
├─ priority (priorité 1-3)
├─ prerequis (prérequis du service)
└─ documentsNecessaires (documents requis)

⚠️  CHAMPS AVEC NOMS DIFFÉRENTS:
├─ dureeEstimee (frontend) ↔ duree_moyenne (DB)
└─ status (frontend) ↔ active (DB)

🔄 CONVERSIONS NÉCESSAIRES:
├─ status: "active"|"maintenance"|"disabled" → active: 1|0  
└─ dureeEstimee: number → duree_moyenne: int

=================================================================
SOLUTION ACTUELLE (ServiceSQLController)
=================================================================

✅ MAPPING FRONTEND → DB (Créer/Modifier):
```javascript
mapFrontendToDb(frontendData) {
  return {
    nom: frontendData.nom,                    // ✅ Direct
    description: frontendData.description,    // ✅ Direct  
    duree_moyenne: frontendData.dureeEstimee, // 🔄 Mapping
    active: frontendData.status === 'active' ? 1 : 0  // 🔄 Conversion
    // ❌ icon, couleur, priority, prerequis, documentsNecessaires → IGNORÉS
  };
}
```

✅ MAPPING DB → FRONTEND (Lire):
```javascript
mapDbToFrontend(dbData) {
  return {
    id: dbData.id,                           // ✅ Direct
    nom: dbData.nom,                         // ✅ Direct
    description: dbData.description,         // ✅ Direct
    dureeEstimee: dbData.duree_moyenne,      // 🔄 Mapping
    status: dbData.active ? 'active' : 'disabled',  // 🔄 Conversion
    // ❌ Valeurs par défaut pour champs manquants:
    icon: '🛎️',                             // Défaut
    couleur: '#c41e3a',                      // Défaut TT
    priority: 2,                             // Normal
    prerequis: '',                          // Vide
    documentsNecessaires: ''                 // Vide
  };
}
```

=================================================================
IMPACT SUR L'APPLICATION
=================================================================

✅ FONCTIONNALITÉS QUI MARCHENT:
├─ Affichage des services (avec valeurs par défaut)
├─ Création de services (nom, description, durée)
├─ Modification de services (nom, description, durée, statut)
└─ Activation/Désactivation des services

❌ FONCTIONNALITÉS PERDUES:
├─ Personnalisation des icônes (toujours 🛎️)
├─ Personnalisation des couleurs (toujours #c41e3a)
├─ Gestion des priorités (toujours niveau 2)
├─ Gestion des prérequis 
└─ Gestion des documents nécessaires

=================================================================
RECOMMANDATIONS
=================================================================

1️⃣ SOLUTION IMMÉDIATE (Actuelle):
   ✅ Utiliser ServiceSQLController avec mapping
   ✅ Accepter la perte des champs non-DB
   
2️⃣ SOLUTION COMPLÈTE (Recommandée):
   🛠️  Ajouter colonnes manquantes à la table services:
   ```sql
   ALTER TABLE services 
   ADD COLUMN icon VARCHAR(10) DEFAULT '🛎️',
   ADD COLUMN couleur VARCHAR(7) DEFAULT '#c41e3a',
   ADD COLUMN priority INT(1) DEFAULT 2,
   ADD COLUMN prerequis TEXT,
   ADD COLUMN documents_necessaires TEXT;
   ```

3️⃣ SOLUTION ALTERNATIVE:
   📦 Créer table services_metadata pour champs additionnels

=================================================================
STATUT ACTUEL: ⚠️  PARTIEL - FONCTIONNE AVEC LIMITATIONS
================================================================= 
