import React, { useState, useEffect } from 'react';
import { jobService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../Styles/Offers.css'; // ou renomme vers Offers.css si tu préfères
import { FaSearch, FaFilter, FaBriefcase, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';

const Offers: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await jobService.getAllJobs();
        setJobs(response.data.jobs);
      } catch (err) {
        toast.error('Erreur lors du chargement des offres d\'emploi');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterLocation(e.target.value);
  };

  const handleViewJob = (jobId: string) => {
    navigate(`/Offers/${jobId}`);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = !filterLocation || 
                           (job.location && job.location.toLowerCase().includes(filterLocation.toLowerCase()));
    
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="job-listing-container">
      <div className="job-listing-header">
        <h1>Offres d'emploi disponibles</h1>
        <p>Découvrez les opportunités qui correspondent à vos compétences</p>
        
        <div className="search-bar">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher par titre, entreprise ou mot-clé..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <button 
            className="filter-toggle" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter /> Filtres
          </button>
        </div>
        
        {showFilters && (
          <div className="filters-section">
            <div className="filter-group">
              <label>Localisation:</label>
              <input
                type="text"
                placeholder="Ville ou pays..."
                value={filterLocation}
                onChange={handleLocationChange}
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="jobs-count">
        {loading ? (
          <p>Chargement des offres...</p>
        ) : (
          <p>{filteredJobs.length} offre(s) trouvée(s)</p>
        )}
      </div>
      
      <div className="job-cards">
        {loading ? (
          <div className="loading-spinner">Chargement...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="no-jobs-message">
            <p>Aucune offre correspondant à votre recherche</p>
          </div>
        ) : (
          filteredJobs.map(job => (
            <div 
              key={job._id} 
              className="job-card"
              onClick={() => handleViewJob(job._id)}
            >
              <h2 className="job-title">{job.title}</h2>
              <h3 className="job-company">{job.company}</h3>
              
              <div className="job-details">
                {job.location && (
                  <span className="job-location">
                    <FaMapMarkerAlt /> {job.location}
                  </span>
                )}
                <span className="job-date">
                  <FaCalendarAlt /> {new Date(job.createdAt).toLocaleDateString()}
                </span>
                <span className="job-type">
                  <FaBriefcase /> Temps plein
                </span>
              </div>
              
              <p className="job-description-preview">
                {job.description.length > 120 
                  ? `${job.description.substring(0, 120)}...` 
                  : job.description
                }
              </p>
              
              {job.technicalSkills && job.technicalSkills.length > 0 && (
                <div className="job-skills">
                  {job.technicalSkills.slice(0, 4).map((skill: string, index: number) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                  {job.technicalSkills.length > 4 && (
                    <span className="skill-more">+{job.technicalSkills.length - 4}</span>
                  )}
                </div>
              )}
              
              <button className="view-details-btn">Voir les détails</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Offers;
