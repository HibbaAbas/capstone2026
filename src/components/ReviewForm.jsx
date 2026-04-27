/** This component is the review form. It consists of two pages, the quick review
 * and the advanced review that the user can toggle between
 * 
 * TODO: quick review is required, make sure user can only toggle to second review 
 * page only when quick review boxes are filled! . 
*/
/** This code was generated mostly by AI */
import { useEffect, useState } from 'react'
import Footer from './Footer'
import Header from './Header'
import { advancedReviewSections, reviewAccessNeeds } from '../data/reviewFormData'
import './ReviewForm.css'

const navItems = [
    { label: 'Explore', href: '#' },
    { label: 'About', href: '#' },
    { label: 'Request', href: '#' },
]

const ratingLabels = ['Bad', 'Poor', 'Average', 'Good', 'Great']
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const initialQuickReview = {
    day: '',
    month: '',
    year: '',
    rating: 0,
    summary: '',
    accessNeeds: [],
}

function createInitialAdvancedReview() {
    return advancedReviewSections.reduce((accumulator, section) => {
        accumulator[section.id] = {
            rating: 0,
            tags: [],
            summary: '',
        }

        return accumulator
    }, {})
}

function RatingRow({ labels = ratingLabels, value = 0, onChange, idPrefix = 'rating' }) {
    return (
        <div className="review-form__rating-row">
            {labels.map((label, index) => {
                const selectedValue = index + 1
                const isSelected = selectedValue <= value

                return (
                    <button
                        className={`review-form__rating-item review-form__rating-button${isSelected ? ' review-form__rating-button--active' : ''}`}
                        key={label}
                        id={`${idPrefix}-${selectedValue}`}
                        type="button"
                        aria-label={`${label} (${selectedValue} star${selectedValue > 1 ? 's' : ''})`}
                        aria-pressed={value === selectedValue}
                        onClick={() => onChange(selectedValue)}
                    >
                        <span className="review-form__star">★</span>
                        <span>{label}</span>
                    </button>
                )
            })}
        </div>
    )
}

function TagList({ items, selectedItems = [], onToggleItem, compact = false }) {
    return (
        <div className={`review-form__tag-list${compact ? ' review-form__tag-list--compact' : ''}`}>
            {items.map((item) => {
                const isSelected = selectedItems.includes(item)

                return (
                    <button
                        className={`review-form__tag ui-chip${isSelected ? ' review-form__tag--active' : ''}`}
                        key={item}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => onToggleItem(item)}
                    >
                        <span>{item}</span>
                        <span aria-hidden="true">{isSelected ? '−' : '+'}</span>
                    </button>
                )
            })}
        </div>
    )
}

// Code for the accordion sections in the advanced review page
// Each section has a rating, a list of tags, and a summary text area.
function AccordionSection({ section, isOpen, onToggle, sectionValue, onSectionChange }) {
    const toggleSectionTag = (tagItem) => {
        const currentTags = sectionValue.tags
        const updatedTags = currentTags.includes(tagItem)
            ? currentTags.filter((existingTag) => existingTag !== tagItem)
            : [...currentTags, tagItem]

        onSectionChange(section.id, {
            ...sectionValue,
            tags: updatedTags,
        })
    }

    return (
        <section className="review-form__accordion-section">
            <button
                className="review-form__accordion-toggle"
                type="button"
                aria-expanded={isOpen}
                onClick={() => onToggle(section.id)}
            >
                <span className="review-form__label">{section.title}</span>
                <span className={`review-form__chevron${isOpen ? ' review-form__chevron--open' : ''}`} aria-hidden="true">
                    ⌄
                </span>
            </button>

            {isOpen ? (
                <div className="review-form__accordion-panel">
                    <p className="review-form__label">{section.ratingPrompt}</p>
                    <RatingRow
                        value={sectionValue.rating}
                        onChange={(nextRating) =>
                            onSectionChange(section.id, {
                                ...sectionValue,
                                rating: nextRating,
                            })
                        }
                        idPrefix={`advanced-rating-${section.id}`}
                    />

                    <div className="review-form__section-block">
                        <h4 className="review-form__label">This venue has...</h4>
                        <TagList
                            items={section.tags}
                            selectedItems={sectionValue.tags}
                            onToggleItem={toggleSectionTag}
                            compact
                        />
                    </div>

                    <div className="review-form__section-block review-form__section-block--summary">
                        <h4 className="review-form__label">Summarize your experience</h4>
                        <p className="review-form__hint">{section.summaryPrompt}</p>
                        <textarea
                            className="review-form__textarea review-form__textarea--large"
                            placeholder="Write about your experience here..."
                            value={sectionValue.summary}
                            onChange={(event) =>
                                onSectionChange(section.id, {
                                    ...sectionValue,
                                    summary: event.target.value,
                                })
                            }
                        />
                    </div>
                </div>
            ) : null}
        </section>
    )
}

function formatReviewDate(day, month, year) {
    const monthNumber = Number(month)
    const monthName = monthNames[monthNumber - 1]

    if (!monthName) {
        return `${month}/${day}/${year}`
    }

    return `${monthName} ${Number(day)}, ${year}`
}

function validateQuickReview(quickReview) {
    const errors = {}

    if (!quickReview.day || !quickReview.month || !quickReview.year) {
        errors.date = 'Please enter a visit date.'
    }

    if (!quickReview.rating) {
        errors.rating = 'Please choose an overall rating.'
    }

    if (!quickReview.summary.trim()) {
        errors.summary = 'Please add a summary before submitting.'
    }

    return errors
}

function ReviewForm({ isOpen, onClose }) {
    const [currentStep, setCurrentStep] = useState(1) // to track which page of review form we're on
    const [openSections, setOpenSections] = useState({}) // to track which advanced review sections are expanded
    const [quickReview, setQuickReview] = useState(initialQuickReview)
    const [advancedReview, setAdvancedReview] = useState(createInitialAdvancedReview)
    const [formErrors, setFormErrors] = useState({})

    // if the form is closed do nothing, else reset form back to default state
    // default state is page 1 with all advanced sections closed
    useEffect(() => {
        if (!isOpen) {
            return
        }

        setCurrentStep(1)
        setOpenSections({})
        setQuickReview(initialQuickReview)
        setAdvancedReview(createInitialAdvancedReview())
        setFormErrors({})
    }, [isOpen])

    if (!isOpen) {
        return null
    }

    // opens and closes the accordion sections
    const toggleSection = (sectionId) => {
        setOpenSections((current) => ({
            ...current,
            [sectionId]: !current[sectionId],
        }))
    }

    const toggleAccessNeed = (accessNeed) => {
        setQuickReview((currentReview) => {
            const currentNeeds = currentReview.accessNeeds
            const nextNeeds = currentNeeds.includes(accessNeed)
                ? currentNeeds.filter((currentNeed) => currentNeed !== accessNeed)
                : [...currentNeeds, accessNeed]

            return {
                ...currentReview,
                accessNeeds: nextNeeds,
            }
        })
    }

    const updateAdvancedSection = (sectionId, updatedSectionData) => {
        setAdvancedReview((currentReview) => ({
            ...currentReview,
            [sectionId]: updatedSectionData,
        }))
    }

    const goToAdditionalDetails = () => {
        const validationErrors = validateQuickReview(quickReview)

        if (Object.keys(validationErrors).length > 0) {
            setFormErrors(validationErrors)
            return
        }

        setFormErrors({})
        setCurrentStep(2)
    }

    const handleSubmit = () => {
        const validationErrors = validateQuickReview(quickReview)

        if (Object.keys(validationErrors).length > 0) {
            setFormErrors(validationErrors)
            setCurrentStep(1)
            return
        }

        window.alert('Thanks for submitting a review!')

        onClose()
    }

    return (
        <div className="review-form-overlay" role="dialog" aria-modal="true" aria-label="Write a review">
            <div className="review-form-shell">
                <Header navItems={navItems} />

                <main className="review-form ui-container--wide">
                    <div className="review-form__progress" aria-label="Review progress">
                        <div className="review-form__progress-step">
                            <div className="review-form__progress-bar review-form__progress-bar--active" />
                            <p>1 of 2 Quick Review (required)</p>
                        </div>

                        <div className="review-form__progress-step">
                            <div
                                className={`review-form__progress-bar${currentStep === 2 ? ' review-form__progress-bar--active' : ''}`}
                            />
                            <p>2 of 2 Additional Details (optional)</p>
                        </div>
                    </div>

                    <h1 className="ui-heading-page">Write A Review</h1>

                    {currentStep === 1 ? (
                        <section className="review-form__page review-form__page--intro">
                            <div className="review-form__column review-form__column--left">
                                <div className="review-form__field-group">
                                    <label className="review-form__label">Date of Visit*</label>
                                    <div className="review-form__date-grid">
                                        <input
                                            className="review-form__input"
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="DD"
                                            value={quickReview.day}
                                            onChange={(event) => setQuickReview((current) => ({ ...current, day: event.target.value }))}
                                        />
                                        <input
                                            className="review-form__input"
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="MM"
                                            value={quickReview.month}
                                            onChange={(event) => setQuickReview((current) => ({ ...current, month: event.target.value }))}
                                        />
                                        <input
                                            className="review-form__input"
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="YYYY"
                                            value={quickReview.year}
                                            onChange={(event) => setQuickReview((current) => ({ ...current, year: event.target.value }))}
                                        />
                                    </div>
                                    {formErrors.date ? <p className="review-form__error">{formErrors.date}</p> : null}
                                </div>

                                <div className="review-form__field-group">
                                    <p className="review-form__label">Rate Your Overall Experience*</p>
                                    <RatingRow
                                        value={quickReview.rating}
                                        onChange={(nextRating) => setQuickReview((current) => ({ ...current, rating: nextRating }))}
                                        idPrefix="quick-rating"
                                    />
                                    {formErrors.rating ? <p className="review-form__error">{formErrors.rating}</p> : null}
                                </div>

                                <div className="review-form__field-group">
                                    <label className="review-form__label" htmlFor="review-summary">
                                        Summarize Your Experience*
                                    </label>
                                    <p className="review-form__hint">
                                        What would you like others to know about this venue? What access features would you like to highlight?
                                    </p>
                                    <textarea
                                        className="review-form__textarea"
                                        id="review-summary"
                                        placeholder="Write about your experience here..."
                                        value={quickReview.summary}
                                        onChange={(event) => setQuickReview((current) => ({ ...current, summary: event.target.value }))}
                                    />
                                    {formErrors.summary ? <p className="review-form__error">{formErrors.summary}</p> : null}
                                </div>
                            </div>

                            <div className="review-form__column review-form__column--right">
                                <div className="review-form__field-group">
                                    <p className="review-form__label">Upload Relevant Photos (optional)</p>
                                    <div className="review-form__upload-box" aria-hidden="true">
                                        <span className="review-form__upload-icon">⇪</span>
                                        <span>Select Photos From Device</span>
                                    </div>
                                </div>

                                <div className="review-form__field-group">
                                    <p className="review-form__label">Share Your Access Needs (optional)</p>
                                    <p className="review-form__hint">
                                        This review includes personal experience around challenges of:
                                    </p>
                                    <TagList
                                        items={reviewAccessNeeds}
                                        selectedItems={quickReview.accessNeeds}
                                        onToggleItem={toggleAccessNeed}
                                    />
                                </div>

                                <div className="review-form__actions review-form__actions--right">
                                    <button className="review-form__button review-form__button--ghost review-form__button--next ui-pill-button ui-pill-button--ghost" type="button" onClick={goToAdditionalDetails}>
                                        Next Page
                                    </button>
                                </div>
                            </div>
                        </section>
                    ) : (
                        <section className="review-form__page review-form__page--advanced">
                            <div className="review-form__accordion-list">
                                {advancedReviewSections.map((section) => (
                                    <AccordionSection
                                        key={section.id}
                                        section={section}
                                        isOpen={Boolean(openSections[section.id])}
                                        onToggle={toggleSection}
                                        sectionValue={advancedReview[section.id]}
                                        onSectionChange={updateAdvancedSection}
                                    />
                                ))}
                            </div>

                            <div className="review-form__actions review-form__actions--split">
                                <button className="review-form__button review-form__button--ghost ui-pill-button ui-pill-button--ghost" type="button" onClick={() => setCurrentStep(1)}>
                                    Previous Page
                                </button>
                                <button className="review-form__button review-form__button--primary ui-pill-button ui-pill-button--primary" type="button" onClick={handleSubmit}>
                                    Submit All
                                </button>
                            </div>
                        </section>
                    )}
                </main>

                <Footer />
            </div>
        </div>
    )
}

export default ReviewForm