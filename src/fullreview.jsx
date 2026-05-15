import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Star, UserCircle } from 'lucide-react'
import { getReview, getVenue } from './db'
import { advancedReviewSections } from './data/reviewFormData'
import Header from './components/Header'
import Footer from './components/Footer'
import './fullreview.css'

const navItems = [
    { label: 'Explore', href: '/explore' },
    { label: 'About', href: '#' },
    { label: 'Request', href: '#' },
]

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
]

function StarDisplay({ rating, max = 5 }) {
    return (
        <span className="fr-stars">
            {Array.from({ length: max }, (_, i) => (
                <Star key={i} size={16} stroke="#4543C6" fill={i < rating ? '#4543C6' : 'none'} />
            ))}
        </span>
    )
}

function formatDate({ day, month, year } = {}) {
    const m = parseInt(month)
    const d = parseInt(day)
    if (!year || isNaN(m) || isNaN(d)) return 'Date not specified'
    const name = monthNames[m - 1] ?? String(month)
    return `${name} ${d}, ${year}`
}


export default function FullReviewPage() {
    const navigate = useNavigate()
    const { venueId, reviewId } = useParams()
    const [review, setReview] = useState(null)
    const [venue, setVenue] = useState(null)

    useEffect(() => {
        getReview(reviewId)
            .then(setReview)
            .catch(() => navigate(`/venues/${venueId}`))
        getVenue(venueId).then(setVenue)
    }, [reviewId, venueId, navigate])

    if (!review || !venue) return null

    const reviewedSectionMap = Object.fromEntries(
        (review.advancedSections ?? []).map((s) => [s.sectionId, s])
    )

    return (
        <div className="fr-page">
            <Header navItems={navItems} />

            <main className="fr-content">
                <button className="fr-back" type="button" onClick={() => navigate(`/venues/${venueId}`)}>
                    ← Back To Overview
                </button>

                {/* ── Author row ── */}
                <div className="fr-header">
                    <div className="fr-header__user">
                        <UserCircle size={40} stroke="#4543C6" strokeWidth={1.2} />
                        <div>
                            <p className="fr-header__name">{review.authorName ?? 'Anonymous'}</p>
                            <p className="fr-header__date">{formatDate(review.dateOfVisit)}</p>
                        </div>
                    </div>

                    {review.accessNeeds?.length > 0 && (
                        <div className="fr-header__tags">
                            {review.accessNeeds.map((tag) => (
                                <span key={tag} className="fr-tag">{tag}</span>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Photos ── */}
                {review.photos?.length > 0 && (
                    <section className="fr-section">
                        <h2 className="fr-section__title">Review Images</h2>
                        <div className="fr-images">
                            {review.photos.map((src, i) => (
                                <img key={i} src={src} alt={`Review photo ${i + 1}`} className="fr-image" />
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Overall experience ── */}
                <section className="fr-section">
                    <div className="fr-section__header">
                        <h2 className="fr-section__title">Overall Experience</h2>
                        <div className="fr-section__rating">
                            <StarDisplay rating={review.overallRating} />
                            <span className="fr-section__score">{review.overallRating}</span>
                        </div>
                    </div>
                    <p className="fr-section__body">{review.summary}</p>
                </section>

                {/* ── Advanced sections — always show all, placeholder when empty ── */}
                {advancedReviewSections.map((def) => {
                    const sec = reviewedSectionMap[def.id]
                    const hasData = sec && (sec.rating > 0 || sec.tags?.length > 0 || sec.summary?.trim())

                    return (
                        <section key={def.id} className="fr-section">
                            <div className="fr-section__header">
                                <h2 className="fr-section__title">{def.title}</h2>
                                {hasData && sec.rating > 0 && (
                                    <div className="fr-section__rating">
                                        <StarDisplay rating={sec.rating} />
                                        <span className="fr-section__score">{sec.rating}</span>
                                    </div>
                                )}
                            </div>

                            {!hasData ? (
                                <p className="fr-section__placeholder">
                                    This reviewer did not leave details for this section.
                                </p>
                            ) : (
                                <>
                                    <p className="fr-section__body">{sec.summary?.trim() ?? ''}</p>

                                    {def.tags?.length > 0 && (
                                        <div className="fr-tags-row">
                                            {def.tags.map((tag) => {
                                                const checked = sec.tags?.includes(tag)
                                                return (
                                                    <span
                                                        key={tag}
                                                        className={`fr-tag-check ${checked ? 'fr-tag-check--yes' : 'fr-tag-check--no'}`}
                                                    >
                                                        {checked ? '✓' : '✕'} {tag}
                                                    </span>
                                                )
                                            })}
                                        </div>
                                    )}
                                </>
                            )}
                        </section>
                    )
                })}
            </main>

            <Footer />
        </div>
    )
}
