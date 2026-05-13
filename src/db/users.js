import { doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

/**
 * addProfile(userId, name, email, location, accessibilityPreferences)
 * Creates a new user profile document in the users collection.
 * Should be called right after Firebase Auth sign-up.
 *
 * userId                   - Firebase Auth UID of the user
 * name                     - display name of the user
 * email                    - email address of the user
 * location                 - optional location string e.g. 'Seattle, WA'
 * accessibilityPreferences - optional array of access needs e.g. ['Wheelchair', 'Hearing Things']
 */
export async function addProfile(userId, name, email, location, accessibilityPreferences = []) {
    if (!userId) throw new Error('userId is required')
    if (!name) throw new Error('name is required')
    if (!email) throw new Error('email is required')

    // can add more field if needed
    const profile = {
        userId, name, email,
        location: location ?? '',
        accessibilityPreferences,
        isAdmin: false,
        createdAt: serverTimestamp(),
    }

    await setDoc(doc(db, 'users', userId), profile)
    return { id: userId, ...profile }
}

/**
 * getProfile(userId)
 * Retrieves a user's profile document from the users collection.
 *
 * userId - Firebase Auth UID of the user
 */
export async function getProfile(userId) {
    if (!userId) throw new Error('userId is required')
    const snap = await getDoc(doc(db, 'users', userId))
    if (!snap.exists()) throw new Error(`Profile for user ${userId} not found`)
    return { ...snap.data(), id: snap.id }
}

/**
 * editProfile(userId, data)
 * Updates a user's profile with the given fields.
 * Protected fields (email, isAdmin, createdAt) are stripped automatically.
 *
 * userId - Firebase Auth UID of the user
 * data   - any subset of profile fields to update e.g. { name, location, accessibilityPreferences }
 */
export async function editProfile(userId, data) {
    if (!userId) throw new Error('userId is required')
    if (!data || Object.keys(data).length === 0) throw new Error('No update data provided')
    const { email: _e, isAdmin: _a, createdAt: _c, ...safeData } = data
    await updateDoc(doc(db, 'users', userId), { ...safeData, updatedAt: serverTimestamp() })
    return { id: userId, ...safeData }
}

/**
 * deleteProfile(userId)
 * Deletes a user's profile document from the users collection.
 * Also need to deleted reviews and saved.
 * call currentUser.delete() separately if needed for sign in auth.
 *
 * userId - Firebase Auth UID of the user
 */
export async function deleteProfile(userId) {
    if (!userId) throw new Error('userId is required')
    await deleteDoc(doc(db, 'users', userId))
    return { id: userId, deleted: true }
}