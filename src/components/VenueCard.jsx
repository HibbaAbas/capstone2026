import { MapPin, Star } from "lucide-react"
import "./VenueCard.css"

export default function VenueCard({ venue }) {
    return (
        <article className="home-venue-card">
            <div className="home-venue-card__image-wrap">
                <img
                    src={venue.image}
                    alt={venue.name}
                    className="home-venue-card__image"
                />
            </div>

            <div className="home-venue-card__body">
                <div className="home-venue-card__title-row">
                    <span className="home-venue-card__name">{venue.name}</span>

                    <span className="home-venue-card__rating">
                        {venue.rating} <Star size={14} />
                    </span>
                </div>

                <div className="home-venue-card__address">
                    <MapPin size={13} />
                    <span>{venue.address}</span>
                </div>

                <div className="home-venue-card__footer">
                    <button
                        className="home-venue-card__more"
                        type="button"
                        onClick={() => {}}
                    >
                        More →
                    </button>
                </div>
            </div>
        </article>
    )
}