const { loginAdmin } = require('../services/authService');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email et mot de passe requis' 
      });
    }

    const result = await loginAdmin(email, password);
    
    res.json({
      message: 'Connexion réussie',
      ...result
    });
  } catch (error) {
    res.status(401).json({ 
      error: error.message 
    });
  }
};

exports.getProfile = async (req, res) => {
  // Sans JWT, on ne peut pas récupérer le profil depuis le token
  res.json({
    message: 'Profil admin - JWT désactivé'
  });
};

exports.logout = async (req, res) => {
  res.json({ message: 'Déconnexion réussie' });
};
