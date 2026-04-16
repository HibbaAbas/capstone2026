import { MapPin, Star } from "lucide-react"
import { useNavigate } from "react-router-dom"
import "./VenueCard.css"

export default function VenueCard({ venue }) {
    const navigate = useNavigate()

    return (
        <article className="venue-card">
            <div className="venue-card__image-wrap">
                <img
                    src={venue.image}
                    alt={venue.name}
                    className="venue-card__image"
                />
            </div>

            <div className="venue-card__body">
                <div className="venue-card__title-row">
                    <span className="venue-card__name">{venue.name}</span>

                    <span className="venue-card__rating">
                        {venue.rating} <Star size={14} />
                    </span>
                </div>

                <div className="venue-card__address">
                    <MapPin size={13} />
                    <span>{venue.address}</span>
                </div>

                <div className="venue-card__footer">
                    <button
                        className="venue-card__more"
                        type="button"
                        onClick={() => navigate(`/venue/${venue.id}`)}
                    >
                        More →
                    </button>
                </div>
            </div>
        </article>
    )
}