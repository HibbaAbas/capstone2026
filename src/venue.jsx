import { MapPin, Star, UserCircle } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import ReviewForm from './components/ReviewForm'
import Header from './components/Header'
import Footer from './components/Footer'
import { getVenueById } from './data/venues'
import './venue.css'

const navItems = [
    { label: 'Explore', href: '/explore' },
    { label: 'About', href: '#' },
    { label: 'Request', href: '#' },
]

const accessCategories = [
    {
        title: 'Parking & Transport',
        rating: 4.2,
        items: [
            { label: 'Dedicated On-Site Parking', available: true },
            { label: 'Nearby Drop-Off/Pick-up', available: false },
        ],
    },
    {
        title: 'Accessible Bathrooms',
        rating: 4.2,
        items: [
            { label: 'Dedicated ADA Bathrooms', available: true },
            { label: 'Emergency Pull Cord', available: true },
            { label: 'Grab/Support Bar', available: false },
        ],
    },
    {
        title: 'In-Venue Accessibility',
        rating: 4.2,
        items: [
            { label: 'Elevator', available: true },
            { label: 'Sensory Room', available: true },
            { label: 'Dedicated ADA Seating', available: true },
            { label: 'Step-Free Entrance', available: false },
        ],
    },
    {
        title: 'Staff',
        rating: 4.2,
        items: [
            { label: 'Helpful Staff', available: true },
            { label: 'Clear Communication', available: true },
            { label: 'Dedicated ADA Staff', available: false },
        ],
    },
]

const reviews = [
    { id: 1, name: 'Mateo', date: 'March 6, 2026', rating: 4, text: 'Overall, I had a pretty pleasant experience at this venue.', tag: 'Wheelchair User' },
    { id: 2, name: 'Norah', date: 'March 6, 2026', rating: 4, text: 'Overall, I had a pretty pleasant experience at this venue.', tag: 'Blind/Visually Impaired' },
    { id: 3, name: 'Jordan', date: 'March 6, 2026', rating: 4, text: 'Overall, I had a pretty pleasant experience at this venue.', tag: 'Deaf/Hard of Hearing' },
    { id: 4, name: 'William', date: 'March 6, 2026', rating: 4, text: 'Overall, I had a pretty pleasant experience at this venue.', tag: 'Communication' },
]

function StarRating({ rating }) {
    const stars = []

    for (let i = 0; i < 5; i++) {
        const isFilled = i < rating
        stars.push(
            <Star
                key={i}
                size={14}
                stroke="#4543C6"
                fill={isFilled ? '#4543C6' : 'none'}
            />
        )
    }

    return <span className="star-rating">{stars}</span>
}

function UserAvatar() {
    return (
        <div className="user-avatar">
            <UserCircle size={36} stroke="#E5E6FA" />
        </div>
    )
}

export default function VenuePage({ isReviewOpen = false }) {
    const navigate = useNavigate()
    const { venueId } = useParams()
    const venue = getVenueById(venueId)

    if (!venue) {
        return null
    }

    return (
        <div className="venue-page">
            <Header navItems={navItems} />

            <main className="venue-content">

                <button className="back-link" type="button" onClick={() => navigate('/explore')}>
                    ← Back To Search Results
                </button>

                <div className="venue-top">
                    <div className="venue-top__image-wrap">
                        <img
                            src={venue.image}
                            alt={venue.name}
                            className="venue-top__image"
                        />
                    </div>

                    <div className="venue-top__info">
                        <h1 className="venue-top__name">{venue.name}</h1>

                        <div className="venue-top__rating-row">
                            <Star size={16} stroke="#4543C6" fill="#4543C6" />
                            <span className="venue-top__score">{venue.rating}</span>
                            <span className="venue-top__review-count">
                                (25 Reviews)
                            </span>
                        </div>

                        <div className="venue-top__address-row">
                            <MapPin size={14} />
                            <span>{venue.address}</span>
                        </div>

                        <div className="venue-top__actions">
                            <button className="btn-outline">
                                View Reviews
                            </button>

                            <button
                                className="btn-solid"
                                type="button"
                                onClick={() => navigate(`/venues/${venue.id}/review`)}
                            >
                                Write A Review
                            </button>
                        </div>
                    </div>
                </div>

                <h2 className="overall-rating">
                    Overall <Star size={16} stroke="#4543C6" fill="#4543C6" /> 4.2
                </h2>

                <div className="access-card">
                    {accessCategories.map((cat) => (
                        <div className="access-category" key={cat.title}>
                            <h3 className="access-category__title">
                                {cat.title}{' '}
                                <Star size={13} stroke="#4543C6" fill="#4543C6" />{' '}
                                {cat.rating}
                            </h3>

                            <ul className="access-items">
                                {cat.items.map((item) => (
                                    <li
                                        key={item.label}
                                        className={`access-item access-item--${
                                            item.available ? 'yes' : 'no'
                                        }`}
                                    >
                                        <span className="access-item__icon">
                                            {item.available ? '✓' : '✕'}
                                        </span>
                                        {item.label}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <h2 className="reviews-heading">Recent Reviews</h2>

                <div className="reviews-grid">
                    {reviews.map((review) => (
                        <article className="review-card" key={review.id}>
                            <div className="review-card__header">
                                <div className="review-card__user">
                                    <UserAvatar />
                                    <div>
                                        <p className="review-card__name">
                                            {review.name}
                                        </p>
                                        <p className="review-card__date">
                                            {review.date}
                                        </p>
                                    </div>
                                </div>

                                <div className="review-card__rating-wrap">
                                    <span className="review-card__score">
                                        {review.rating}
                                    </span>
                                    <StarRating rating={review.rating} />
                                </div>
                            </div>

                            <p className="review-card__text">
                                {review.text}
                            </p>

                            <div className="review-card__footer">
                                <span className="review-card__tag">
                                    {review.tag}
                                </span>
                                <button className="review-card__read">
                                    Read Review →
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </main>

            <Footer />

            <ReviewForm
                isOpen={isReviewOpen}
                onClose={() => navigate(`/venues/${venue.id}`)}
            />
        </div>
    )
}