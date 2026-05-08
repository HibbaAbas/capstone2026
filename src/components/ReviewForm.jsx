/** This component is the review form. It consists of two pages, the quick review
 * and the advanced review that the user can toggle between
 *
 * TODO: quick review is required, make sure user can only toggle to second review
 * page only when quick review boxes are filled! .
 */
/** This code was generated mostly by AI */
import { useEffect, useState } from "react";
import Footer from "./Footer";
import Header from "./Header";
import {
  advancedReviewSections,
  reviewAccessNeeds,
} from "../data/reviewFormData";
import "./ReviewForm.css";

const navItems = [
  { label: "Explore", href: "#" },
  { label: "About", href: "#" },
  { label: "Request", href: "#" },
];

const ratingLabels = ["Bad", "Poor", "Average", "Good", "Great"];

function RatingRow({ labels = ratingLabels }) {
  return (
    <div className="review-form__rating-row" aria-hidden="true">
      {labels.map((label) => (
        <div className="review-form__rating-item" key={label}>
          <span className="review-form__star">★</span>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function TagList({ items, compact = false }) {
  return (
    <div
      className={`review-form__tag-list${compact ? " review-form__tag-list--compact" : ""}`}
    >
      {items.map((item) => (
        <button className="review-form__tag ui-chip" key={item} type="button">
          <span>{item}</span>
          <span aria-hidden="true">+</span>
        </button>
      ))}
    </div>
  );
}

// Code for the accordion sections in the advanced review page
// Each section has a rating, a list of tags, and a summary text area.
function AccordionSection({ section, isOpen, onToggle }) {
  return (
    <section className="review-form__accordion-section">
      <button
        className="review-form__accordion-toggle"
        type="button"
        aria-expanded={isOpen}
        onClick={() => onToggle(section.id)}
      >
        <span className="review-form__label">{section.title}</span>
        <span
          className={`review-form__chevron${isOpen ? " review-form__chevron--open" : ""}`}
          aria-hidden="true"
        >
          ⌄
        </span>
      </button>

      {isOpen ? (
        <div className="review-form__accordion-panel">
          <p className="review-form__label">{section.ratingPrompt}</p>
          <RatingRow />

          <div className="review-form__section-block">
            <h4 className="review-form__label">This venue has...</h4>
            <TagList items={section.tags} compact />
          </div>

          <div className="review-form__section-block review-form__section-block--summary">
            <h4 className="review-form__label">Summarize your experience</h4>
            <p className="review-form__hint">{section.summaryPrompt}</p>
            <textarea
              className="review-form__textarea review-form__textarea--large"
              placeholder="Write about your experience here..."
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ReviewForm({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(1); // to track which page of review form we're on
  const [openSections, setOpenSections] = useState(
    advancedReviewSections.length > 0
      ? { [advancedReviewSections[0].id]: true }
      : {},
  ); // to track which advanced review sections are expanded

  // if the form is closed do nothing, else reset form back to default state
  // default state is page 1 with all advanced sections closed
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setCurrentStep(1);
    setOpenSections(
      advancedReviewSections.length > 0
        ? { [advancedReviewSections[0].id]: true }
        : {},
    );
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  // opens and closes the accordion sections
  const toggleSection = (sectionId) => {
    setOpenSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  };

  return (
    <div
      className="review-form-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Write a review"
    >
      <div className="review-form-shell">
        <Header navItems={navItems} />
        <button
          className="review-form__cancel"
          type="button"
          onClick={onClose}
          aria-label="Cancel review"
        >
          ✕ Cancel Review
        </button>

        <main className="review-form ui-container--wide">
          <div className="review-form__progress" aria-label="Review progress">
            <div className="review-form__progress-step">
              <div className="review-form__progress-bar review-form__progress-bar--active" />
              <p>1 of 2 Quick Review (required)</p>
            </div>

            <div className="review-form__progress-step">
              <div
                className={`review-form__progress-bar${currentStep === 2 ? " review-form__progress-bar--active" : ""}`}
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
                      className="review-form__date-picker"
                      type="date"
                      aria-label="Date of visit"
                    />
                  </div>
                </div>

                <div className="review-form__field-group">
                  <p className="review-form__label">
                    Rate Your Overall Experience*
                  </p>
                  <RatingRow />
                </div>

                <div className="review-form__field-group">
                  <label
                    className="review-form__label"
                    htmlFor="review-summary"
                  >
                    Summarize Your Experience*
                  </label>
                  <p className="review-form__hint">
                    What would you like others to know about this venue? What
                    access features would you like to highlight?
                  </p>
                  <textarea
                    className="review-form__textarea"
                    id="review-summary"
                    placeholder="Write about your experience here..."
                  />
                </div>
              </div>

              <div className="review-form__column review-form__column--right">
                <div className="review-form__field-group">
                  <p className="review-form__label">
                    Upload Relevant Photos (optional)
                  </p>
                  <div className="review-form__upload-box" aria-hidden="true">
                    <span className="review-form__upload-icon">⇪</span>
                    <span>Select Photos From Device</span>
                  </div>
                </div>

                <div className="review-form__field-group">
                  <p className="review-form__label">
                    Your Accessibility Experience (optional)
                  </p>
                  <p className="review-form__hint">
                    Select any areas that are relevant to your visit. This helps
                    others with similar needs find your review.
                  </p>
                  <TagList items={reviewAccessNeeds} />
                </div>

                <div className="review-form__actions review-form__actions--right">
                  <button
                    className="review-form__button review-form__button--ghost review-form__button--next ui-pill-button ui-pill-button--ghost"
                    type="button"
                    onClick={() => setCurrentStep(2)}
                  >
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
                  />
                ))}
              </div>

              <div className="review-form__actions review-form__actions--split">
                <button
                  className="review-form__button review-form__button--ghost ui-pill-button ui-pill-button--ghost"
                  type="button"
                  onClick={() => setCurrentStep(1)}
                >
                  Previous Page
                </button>
                <button
                  className="review-form__button review-form__button--primary ui-pill-button ui-pill-button--primary"
                  type="button"
                  onClick={onClose}
                >
                  Submit All
                </button>
              </div>
            </section>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default ReviewForm;
