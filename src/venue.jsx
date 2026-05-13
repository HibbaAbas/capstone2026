import { MapPin, Star, UserCircle } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import ReviewForm from './components/ReviewForm'
import Header from './components/Header'
import Footer from './components/Footer'
import { getVenue, getReviewsForVenue, voteReview } from './db'
import { auth } from './firebase'
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
    const [venue, setVenue] = useState(null)
    const [reviews, setReviews] = useState([])
    const reviewsRef = useRef(null)

    const handleVote = async (review, voteType) => {
        const userId = auth.currentUser?.uid
        if (!userId) return

        const alreadyUpvoted = review.upvotedBy?.includes(userId)
        const alreadyDownvoted = review.downvotedBy?.includes(userId)

        // update UI instantly without waiting for Firestore
        setReviews((current) => current.map((r) => {
            if (r.id !== review.id) return r

            let upvotedBy = [...(r.upvotedBy ?? [])]
            let downvotedBy = [...(r.downvotedBy ?? [])]

            if (voteType === 'up') {
                upvotedBy = alreadyUpvoted ? upvotedBy.filter((id) => id !== userId) : [...upvotedBy, userId]
                downvotedBy = downvotedBy.filter((id) => id !== userId)
            } else {
                downvotedBy = alreadyDownvoted ? downvotedBy.filter((id) => id !== userId) : [...downvotedBy, userId]
                upvotedBy = upvotedBy.filter((id) => id !== userId)
            }

            return {
                ...r,
                upvotes: upvotedBy.length,
                downvotes: downvotedBy.length,
                upvotedBy,
                downvotedBy,
            }
        }))

        // then save to Firestore in the background
        await voteReview(review.id, userId, voteType)
    }

    useEffect(() => {
        getVenue(venueId).then(setVenue)
        getReviewsForVenue(venueId).then(setReviews)
    }, [venueId])

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
                            <span className="venue-top__review-count">({venue.reviewCount ?? 0} Reviews)</span>
                        </div>

                        <div className="venue-top__address-row">
                            <MapPin size={14} />
                            <span>{venue.address}</span>
                        </div>

                        <div className="venue-top__actions">
                            <button
                                className="btn-outline"
                                type="button"
                                onClick={() => reviewsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                            >
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
                    Overall <Star size={16} stroke="#4543C6" fill="#4543C6" /> {venue.rating ?? 0}
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
                                        className={`access-item access-item--${item.available ? 'yes' : 'no'
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

                <h2 className="reviews-heading" ref={reviewsRef}>Recent Reviews</h2>

                <div className="reviews-grid">
                    {reviews.map((review) => (
                        <article className="review-card" key={review.id}>
                            <div className="review-card__header">
                                <div className="review-card__user">
                                    <UserAvatar />
                                    <div>
                                        <p className="review-card__name">
                                            {review.authorName ?? 'Anonymous'}
                                        </p>
                                        <p className="review-card__date">
                                            {review.dateOfVisit?.month}/{review.dateOfVisit?.day}/{review.dateOfVisit?.year}
                                        </p>
                                    </div>
                                </div>

                                <div className="review-card__rating-wrap">
                                    <span className="review-card__score">
                                        {review.overallRating}
                                    </span>
                                    <StarRating rating={review.overallRating} />
                                </div>
                            </div>

                            <p className="review-card__text">
                                {review.summary}
                            </p>

                            <div className="review-card__footer">
                                <span className="review-card__tag">
                                    {review.accessNeeds?.[0] ?? ''}
                                </span>
                                <div className="review-card__votes">
                                    <button
                                        type="button"
                                        className={`review-card__vote-btn${review.upvotedBy?.includes(auth.currentUser?.uid) ? ' review-card__vote-btn--active-up' : ''}`}
                                        onClick={() => handleVote(review, 'up')}
                                        aria-label="Upvote"
                                    >
                                        ▲ <span>{review.upvotes ?? 0}</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`review-card__vote-btn${review.downvotedBy?.includes(auth.currentUser?.uid) ? ' review-card__vote-btn--active-down' : ''}`}
                                        onClick={() => handleVote(review, 'down')}
                                        aria-label="Downvote"
                                    >
                                        ▼ <span>{review.downvotes ?? 0}</span>
                                    </button>
                                </div>
                                <button
                                    className="review-card__read"
                                    type="button"
                                    onClick={() => navigate(`/venues/${venueId}/reviews/${review.id}`)}
                                >
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
                onSubmitted={() => getReviewsForVenue(venueId).then(setReviews)}
            />
        </div>
    )
}