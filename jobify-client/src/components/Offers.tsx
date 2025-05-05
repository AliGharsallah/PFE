import React from 'react';
import '../Styles/Offers.css'; 

const Offers = () => {
  const offers = [
    {
      title: "Développeur Full Stack",
      description: "Rejoignez notre équipe dynamique pour construire des applications web performantes.",
    },
    {
      title: "Chef de projet IT",
      description: "Coordonnez des projets innovants au sein d'une entreprise technologique en pleine croissance.",
    },
    {
      title: "UI/UX Designer",
      description: "Créez des interfaces intuitives et attrayantes pour nos utilisateurs.",
    },
  ];

  return (
    <div className="dashboard-content">
  
      <div className="job-list">
        {offers.map((offer, index) => (
          <div className="job-card" key={index}>
            <div className="job-title">{offer.title}</div>
            <div className="job-description">{offer.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Offers;
