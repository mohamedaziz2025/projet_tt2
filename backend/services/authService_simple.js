require('dotenv').config();
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

// Login admin sans JWT - juste vérification des identifiants
const loginAdmin = async (email, password) => {
  console.log('🔐 Tentative de connexion:', email);
  
  const admin = await Admin.findOne({ where: { email } });
  
  if (!admin) {
    console.log('❌ Admin non trouvé:', email);
    throw new Error('Email ou mot de passe incorrect');
  }

  console.log('✅ Admin trouvé:', admin.email);
  console.log('🔑 Vérification du mot de passe...');
  
  const isPasswordValid = await admin.comparePassword(password);
  console.log('🔍 Résultat comparaison:', isPasswordValid);
  
  if (!isPasswordValid) {
    console.log('❌ Mot de passe incorrect pour:', email);
    throw new Error('Email ou mot de passe incorrect');
  }

  console.log('✅ Connexion réussie pour:', email);
  
  return {
    admin: {
      id: admin.id,
      email: admin.email,
      nom: admin.nom,
      prenom: admin.prenom,
      role: admin.role
    }
  };
};

// Créer un admin par défaut
const createDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@tunisietelecom.tn';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    console.log('🔧 Vérification admin avec email:', adminEmail);

    const adminExists = await Admin.findOne({ 
      where: { email: adminEmail } 
    });

    if (!adminExists) {
      await Admin.create({
        email: adminEmail,
        password: adminPassword,
        nom: 'Admin',
        prenom: 'Tunisie Telecom',
        role: 'admin'
      });
      console.log('✅ Admin par défaut créé:', adminEmail);
    } else {
      console.log('ℹ️ Admin existe déjà:', adminEmail);
    }
  } catch (error) {
    console.error('❌ Erreur création admin:', error.message);
  }
};

module.exports = {
  loginAdmin,
  createDefaultAdmin
};
