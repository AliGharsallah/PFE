
const { StatusCodes } = require('http-status-codes');

const errorHandlerMiddleware = (err, req, res, next) => {
  // Objet d'erreur par défaut
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || 'Une erreur est survenue, veuillez réessayer plus tard'
  };

  // Gérer les erreurs de validation de Mongoose
  if (err.name === 'ValidationError') {
    customError.message = Object.values(err.errors)
      .map((item) => item.message)
      .join(', ');
    customError.statusCode = 400;
  }

  // Gérer les erreurs de duplication de Mongoose (ex: email unique)
  if (err.code && err.code === 11000) {
    customError.message = `La valeur ${Object.keys(
      err.keyValue
    )} existe déjà, veuillez choisir une autre valeur`;
    customError.statusCode = 400;
  }

  // Gérer les erreurs de cast de Mongoose (ex: ID invalide)
  if (err.name === 'CastError') {
    customError.message = `Aucun élément trouvé avec l'id : ${err.value}`;
    customError.statusCode = 404;
  }

  return res.status(customError.statusCode).json({ message: customError.message });
};

module.exports = errorHandlerMiddleware;