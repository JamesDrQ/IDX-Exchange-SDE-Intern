import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./PropertyDetailPage.css";
import usePropertyDetails from "../hooks/usePropertyDetails";
import {
  parsePropertyPhotos,
  parseOpenHouseRemarks,
} from "../utils/propertyUtils";

function PropertyDetailPage() {
  const { id } = useParams();
  const { property, openHouses, loading, error } = usePropertyDetails(id);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (loading) {
    return <p>Loading property...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const photos = parsePropertyPhotos(property.L_Photos);

  function handlePreviousPhoto(event) {
    event.stopPropagation();

    setCurrentPhotoIndex((currentIndex) =>
      currentIndex === 0 ? photos.length - 1 : currentIndex - 1
    );
  }

  function handleNextPhoto(event) {
    event.stopPropagation();

    setCurrentPhotoIndex((currentIndex) =>
      currentIndex === photos.length - 1 ? 0 : currentIndex + 1
    );
  }

  const latitude = property.LMD_MP_Latitude;
  const longitude = property.LMD_MP_Longitude;

  return (
    <div className="property-detail-page">
      <Link className="back-link" to="/">
        ← Back to Listings
      </Link>

      {photos.length > 0 && (
        <div className="property-gallery">
          <img
            className="main-property-photo"
            src={photos[currentPhotoIndex]}
            alt={property.L_Address || "Property"}
            onClick={() => setLightboxOpen(true)}
          />

          <div className="thumbnail-row">
            {photos.map((photo, index) => (
              <img
                key={index}
                className={`property-thumbnail ${
                  index === currentPhotoIndex ? "active" : ""
                }`}
                src={photo}
                alt={`Property ${index + 1}`}
                onClick={() => setCurrentPhotoIndex(index)}
              />
            ))}
          </div>
        </div>
      )}

    <div className="property-summary">
      <div className="property-price">
        ${Number(property.L_SystemPrice).toLocaleString()}
      </div>

      <h1 className="property-address">{property.L_Address}</h1>

      <div className="property-location">
        {property.L_City}, {property.L_State} {property.L_Zip}
      </div>

      <div className="property-stats">
        <div>
          <strong>{property.L_Keyword2 ?? "N/A"}</strong>
          <span>Beds</span>
        </div>

        <div>
          <strong>{property.LM_Dec_3 ?? "N/A"}</strong>
          <span>Baths</span>
        </div>

        <div>
          <strong>
            {property.LM_Int2_3
              ? Number(property.LM_Int2_3).toLocaleString()
              : "N/A"}
          </strong>
          <span>Sq Ft</span>
        </div>
      </div>
    </div>

    <section className="detail-section">
      <h2>Description</h2>

      <p className="property-description">
        {property.L_Remarks || "No description available."}
      </p>
    </section>

    <section className="detail-section">
      <h2>Property Details</h2>

      <div className="details-grid">
        <div className="detail-item">
          <span className="detail-label">Property Type</span>
          <span className="detail-value">
            {property.L_Type_ || "N/A"}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Year Built</span>
          <span className="detail-value">
            {property.YearBuilt || "N/A"}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Stories</span>
          <span className="detail-value">
            {property.StoriesTotal || "N/A"}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Lot Size</span>
          <span className="detail-value">
            {property.LotSizeAcres
              ? `${property.LotSizeAcres} acres`
              : "N/A"}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Status</span>
          <span className="detail-value">
            {property.L_Status || "N/A"}
          </span>
        </div>
      </div>
    </section>

    {latitude && longitude && (
      <section className="detail-section location-section">
        <div className="location-header">
          <h2>Location</h2>

          <a
            className="directions-link"
            href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Get Directions ↗
          </a>
        </div>

        <div className="map-container">
          <iframe
            title="Property location"
            loading="lazy"
            allowFullScreen
            src={`https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
          />
        </div>
      </section>
    )}

    <section className="detail-section open-house-section">
      <h2>Open Houses</h2>

      {openHouses.length > 0 ? (
        <div className="open-house-list">
          {openHouses.map((openHouse, index) => {
            const remarks = parseOpenHouseRemarks(openHouse.all_data);

            return (
              <div className="open-house-card" key={index}>
                <div className="open-house-date">
                  {new Date(openHouse.OpenHouseDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>

                <div className="open-house-time">
                  {new Date(
                    `1970-01-01T${openHouse.OH_StartTime}`
                  ).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  {" – "}
                  {new Date(
                    `1970-01-01T${openHouse.OH_EndTime}`
                  ).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>

                {remarks && (
                  <p className="open-house-remarks">{remarks}</p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-open-house">
          No open houses currently scheduled.
        </div>
      )}
    </section>

    {lightboxOpen && (
      <div
        onClick={() => setLightboxOpen(false)}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0, 0, 0, 0.9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
      >
      {photos.length > 1 && (
        <>
        <button
          type="button"
          onClick={handlePreviousPhoto}
          style={{
            position: "absolute",
            left: "30px",
            fontSize: "40px",
            cursor: "pointer",
          }}
        >
          ←
        </button>

        <button
          type="button"
          onClick={handleNextPhoto}
          style={{
            position: "absolute",
            right: "30px",
            fontSize: "40px",
            cursor: "pointer",
          }}
        >
          →
        </button>
        </>
      )}

        <img
          src={photos[currentPhotoIndex]}
          alt={property.L_Address || "Property"}
          onClick={(event) => event.stopPropagation()}
          style={{
            maxWidth: "90vw",
            maxHeight: "90vh",
            objectFit: "contain",
          }}
        />

      </div>
    )}
    </div>
  );
}

export default PropertyDetailPage;