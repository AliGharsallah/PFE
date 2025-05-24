import React from "react";
import '../Styles/Card.css'
export default function Card({ title, description, image }) {
  return (
    <div className={"feature-card"}>
      <img src={image} alt={title} />
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}