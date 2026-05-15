import { MapPin, Star, UserCircle } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import ReviewForm from './components/ReviewForm'
import Header from './components/Header'
import Footer from './components/Footer'
import { getVenue, getReviewsForVenue, deleteReview, voteReview } from './db'
import { auth } from './firebase'
import { advancedReviewSections } from './data/reviewFormData'
import './venue.css'

const navItems = [
    { label: 'Explore', href: '/explore' },
    { label: 'About', href: '#' },
    { label: 'Request', href: '#' },
]

function computeAccessData(reviews) {
    const tagData = {}

    for (const review of reviews) {
        for (const section of (review.advancedSections ?? [])) {
            for (const tag of (section.tags ?? [])) {
                if (!tagData[tag]) {
                    tagData[tag] = { count: 0, lastDateObj: null, lastDate: null }
                }
                tagData[tag].count += 1

                const { day, month, year } = review.dateOfVisit ?? {}
                if (day && month && year) {
                    const d = new Date(year, month - 1, day)
                    if (!tagData[tag].lastDateObj || d > tagData[tag].lastDateObj) {
                        tagData[tag].lastDateObj = d
                        tagData[tag].lastDate = `${month}/${day}/${String(year).slice(-2)}`
                    }
                }
            }
        }
    }

    return advancedReviewSections.map((section) => {
        const sectionRatings = reviews
            .flatMap((r) => r.advancedSections ?? [])
            .filter((s) => s.sectionId === section.id && s.rating != null)
            .map((s) => s.rating)

        const rating = sectionRatings.length > 0
            ? parseFloat((sectionRatings.reduce((a, b) => a + b, 0) / sectionRatings.length).toFixed(1))
            : null

        const items = section.tags
            .map((tag) => ({
                label: tag,
                count: tagData[tag]?.count ?? 0,
                lastDate: tagData[tag]?.lastDate ?? null,
                available: (tagData[tag]?.count ?? 0) > 0,
            }))
            .sort((a, b) => b.count - a.count)

        return { title: section.title, rating, items }
    })
}


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

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Delete this review?')) return
        await deleteReview(reviewId)
        setReviews((current) => current.filter((r) => r.id !== reviewId))
        getVenue(venueId).then(setVenue)
    }

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

    const accessData = computeAccessData(reviews)

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
                    {accessData.map((cat) => (
                        <div className="access-category" key={cat.title}>
                            <h3 className="access-category__title">
                                {cat.title}{' '}
                                    <>
                                    <Star size={13} stroke="#4543C6" fill="#4543C6" />{' '}
                                    {cat.rating != null ? cat.rating : '0'}
                                </>
                            </h3>

                            <ul className="access-items">
                                {cat.items.map((item) => (
                                    <li
                                        key={item.label}
                                        className={`access-item access-item--${item.available ? 'yes' : 'no'}`}
                                    >
                                        {item.count > 0 && (
                                            <div className="access-item__tooltip">
                                                <div className="access-item__tooltip-reports">
                                                    {item.count} report{item.count !== 1 ? 's' : ''} of this feature
                                                </div>
                                                {item.lastDate && (
                                                    <div className="access-item__tooltip-date">
                                                        Last reported: {item.lastDate}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <span className="access-item__icon">
                                            {item.available ? '✓' : '✕'}
                                        </span>
                                        {item.label}{item.count > 0 ? ` (${item.count})` : ''}
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

                                <div className="review-card__header-right">
                                    <div className="review-card__rating-wrap">
                                        <span className="review-card__score">
                                            {review.overallRating}
                                        </span>
                                        <StarRating rating={review.overallRating} />
                                    </div>

                                    {auth.currentUser?.uid === review.userId && (
                                        <button
                                            className="review-card__delete"
                                            type="button"
                                            onClick={() => handleDelete(review.id)}
                                            aria-label="Delete review"
                                        >
                                            Delete 
                                        </button>
                                    )}
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
                onSubmitted={() => {
                    getReviewsForVenue(venueId).then(setReviews)
                    getVenue(venueId).then(setVenue)
                }}
            />
        </div>
    )
}