import { collection, doc, getDoc, getDocs, updateDoc, deleteDoc, query, where, serverTimestamp, runTransaction } from 'firebase/firestore'
import { db } from '../firebase'

const reviewsCol = collection(db, 'reviews')

/**
 * addReview(userId, venueId, reviewData)
 * Creates a new review linked to a user and venue.
 * 
 * userId - Firebase Auth UID of the reviewer
 * venueId - Firestore document ID of the venue being reviewed
 * reviewData - {
 *   dateOfVisit: { day, month, year },
 *   overallRating: number (1–5),
 *   summary: string,
 *   authorName: string,
 *   accessNeeds: string[],
 *   photos: string[],
 *   advancedSections: [{ sectionId, rating, tags, summary }]
 * }
 */
export async function addReview(userId, venueId, reviewData) {
    if (!userId) throw new Error('userId is required')
    if (!venueId) throw new Error('venueId is required')

    const { dateOfVisit, overallRating, summary } = reviewData
    if (!dateOfVisit || !overallRating || !summary) throw new Error('dateOfVisit, overallRating, and summary are required')
    if (overallRating < 1 || overallRating > 5) throw new Error('overallRating must be between 1 and 5')

    const venueRef = doc(db, 'venues', venueId)
    let reviewId

    await runTransaction(db, async (t) => {
        const venueSnap = await t.get(venueRef)
        if (!venueSnap.exists()) throw new Error(`Venue ${venueId} not found`)

        const { reviewCount = 0, rating = 0 } = venueSnap.data()
        const newCount = reviewCount + 1
        const newRating = parseFloat(((rating * reviewCount + Number(overallRating)) / newCount).toFixed(1))

        const newReviewRef = doc(reviewsCol)
        reviewId = newReviewRef.id

        // fill in new review doc, can change values it take in if needed
        t.set(newReviewRef, {
            userId, venueId, dateOfVisit, summary,
            authorName: reviewData.authorName ?? 'Anonymous',
            overallRating: Number(overallRating),
            accessNeeds: reviewData.accessNeeds ?? [],
            photos: reviewData.photos ?? [],
            advancedSections: reviewData.advancedSections ?? [],
            createdAt: serverTimestamp(),
        })

        t.update(venueRef, { rating: newRating, reviewCount: newCount })
    })

    return { id: reviewId, userId, venueId, ...reviewData }
}

/**
 * getReview(reviewId)
 * Retrieves a single review by its Firestore document ID.
 *
 * reviewId - Firestore document ID of the review
 */
export async function getReview(reviewId) {
    if (!reviewId) throw new Error('reviewId is required')
    const snap = await getDoc(doc(db, 'reviews', reviewId))
    if (!snap.exists()) throw new Error(`Review ${reviewId} not found`)
    return { ...snap.data(), id: snap.id }
}

/**
 * getReviews(accessNeed)
 * Retrieves all reviews that include a given access need tag.
 *
 * filters - e.g. 'Wheelchair', 'Hearing Things'
 */
export async function getReviews(filters = {}) {
    const { accessNeed } = filters

    const constraints = []
    if (accessNeed) constraints.push(where('accessNeeds', 'array-contains', accessNeed))

    const snap = await getDocs(query(reviewsCol, ...constraints))
    return snap.docs.map((d) => ({ ...d.data(), id: d.id }))
}

/**
 * getReviewsForVenue(venueId)
 * Retrieves all reviews for a given venue.
 *
 * venueId - Firestore document ID of the venue
 */
export async function getReviewsForVenue(venueId) {
    if (!venueId) throw new Error('venueId is required')
    const snap = await getDocs(query(reviewsCol, where('venueId', '==', venueId)))
    return snap.docs.map((d) => ({ ...d.data(), id: d.id }))
}

/**
 * getReviewsByUser(userId)
 * Retrieves all reviews written by a given user.
 *
 * userId - Firebase Auth UID of the user
 */
export async function getReviewsByUser(userId) {
    if (!userId) throw new Error('userId is required')
    const snap = await getDocs(query(reviewsCol, where('userId', '==', userId)))
    return snap.docs.map((d) => ({ ...d.data(), id: d.id }))
}

/**
 * updateReview(reviewId, reviewData)
 * Updates a review with the given review data.
 * Only the review author should call this.
 *
 * reviewId - Firestore document ID of the review
 * reviewData - any subset of review fields to update
 */
export async function updateReview(reviewId, reviewData) {
    if (!reviewId) throw new Error('reviewId is required')
    await updateDoc(doc(db, 'reviews', reviewId), { ...reviewData, updatedAt: serverTimestamp() })
    return { id: reviewId, ...reviewData }
}

/**
 * deleteReview(reviewId)
 * Deletes a review document.
 * Only the review author should call this.
 *
 * reviewId - Firestore document ID of the review
 */
export async function deleteReview(reviewId) {
    if (!reviewId) throw new Error('reviewId is required')

    const reviewRef = doc(db, 'reviews', reviewId)
    const reviewSnap = await getDoc(reviewRef)
    if (!reviewSnap.exists()) throw new Error(`Review ${reviewId} not found`)

    const { venueId } = reviewSnap.data()
    await deleteDoc(reviewRef)

    const remaining = (await getDocs(query(reviewsCol, where('venueId', '==', venueId)))).docs.map((d) => d.data())
    const count = remaining.length
    const rating = count === 0
        ? 0
        : parseFloat((remaining.reduce((sum, r) => sum + Number(r.overallRating), 0) / count).toFixed(1))

    await updateDoc(doc(db, 'venues', venueId), { rating, reviewCount: count })

    return { id: reviewId, deleted: true }
}

/**
 * voteReview(reviewId, userId, voteType)
 * Toggles an upvote or downvote on a review.
 * Removes the opposite vote if already cast.
 *
 * reviewId - Firestore document ID of the review
 * userId - Firebase Auth UID of the user voting
 * voteType - 'up' or 'down'
 */

export async function voteReview(reviewId, userId, voteType) {
    if (!reviewId) throw new Error('reviewId is required')
    if (!userId) throw new Error('userId is required')
    if (voteType !== 'up' && voteType !== 'down') throw new Error('voteType must be up or down')

    const reviewRef = doc(db, 'reviews', reviewId)

    await runTransaction(db, async (t) => {
        const snap = await t.get(reviewRef)
        if (!snap.exists()) throw new Error(`Review ${reviewId} not found`)

        const { upvotedBy = [], downvotedBy = [] } = snap.data()

        const alreadyUpvoted = upvotedBy.includes(userId)
        const alreadyDownvoted = downvotedBy.includes(userId)

        let newUpvotedBy = [...upvotedBy]
        let newDownvotedBy = [...downvotedBy]

        if (voteType === 'up') {
            // toggle upvote off if already upvoted
            newUpvotedBy = alreadyUpvoted
                ? upvotedBy.filter((id) => id !== userId)
                : [...upvotedBy, userId]
            // remove downvote if switching
            newDownvotedBy = downvotedBy.filter((id) => id !== userId)
        } else {
            // toggle downvote off if already downvoted
            newDownvotedBy = alreadyDownvoted
                ? downvotedBy.filter((id) => id !== userId)
                : [...downvotedBy, userId]
            // remove upvote if switching
            newUpvotedBy = upvotedBy.filter((id) => id !== userId)
        }

        t.update(reviewRef, {
            upvotes: newUpvotedBy.length,
            downvotes: newDownvotedBy.length,
            upvotedBy: newUpvotedBy,
            downvotedBy: newDownvotedBy,
        })
    })
}