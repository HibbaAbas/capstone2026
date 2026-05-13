import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { getVenue } from './venues'

/**
 * addSaved(userId, venueId)
 * Adds a venue to the user's saved collection.
 *
 * userId - Firebase Auth UID of the user
 * venueId - Firestore document ID of the venue to save
 */
export async function addSaved(userId, venueId) {
    if (!userId) throw new Error('userId is required')
    if (!venueId) throw new Error('venueId is required')
    await getVenue(venueId)
    await setDoc(doc(db, 'users', userId, 'saved', venueId), { venueId, savedAt: serverTimestamp() })
    return { userId, venueId, saved: true }
}

/**
 * removeSaved(userId, venueId)
 * Removes a venue from the user's saved collection.
 *
 * userId - Firebase Auth UID of the user
 * venueId - Firestore document ID of the venue to remove
 */
export async function removeSaved(userId, venueId) {
    if (!userId) throw new Error('userId is required')
    if (!venueId) throw new Error('venueId is required')
    await deleteDoc(doc(db, 'users', userId, 'saved', venueId))
    return { userId, venueId, saved: false }
}

/**
 * getSaved(userId)
 * Retrieves all saved venues for a user with full venue data joined in.
 *
 * userId - Firebase Auth UID of the user
 */
export async function getSaved(userId) {
    if (!userId) throw new Error('userId is required')
    const snapshot = await getDocs(collection(db, 'users', userId, 'saved'))
    if (snapshot.empty) return []
    const venues = await Promise.all(snapshot.docs.map((d) => getVenue(d.id).catch(() => null)))
    return venues.filter(Boolean)
}

/**
 * isSaved(userId, venueId)
 * Returns true if the given venue is in the user's saved collection.
 * Used to toggle the save/unsave button state on the venue page.
 *
 * userId - Firebase Auth UID of the user
 * venueId - Firestore document ID of the venue to check
 */
export async function isSaved(userId, venueId) {
    if (!userId || !venueId) return false
    return (await getDoc(doc(db, 'users', userId, 'saved', venueId))).exists()
}