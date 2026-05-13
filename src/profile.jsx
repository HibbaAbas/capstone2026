import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'
import { UserCircle } from 'lucide-react'
import { auth } from './firebase'
import { getProfile, editProfile, getSaved, getReviewsByUser } from './db'
import Header from './components/Header'
import Footer from './components/Footer'
import VenueCard from './components/VenueCard'
import './profile.css'

const navItems = [
    { label: 'Explore', href: '/explore' },
    { label: 'About', href: '#' },
    { label: 'Request', href: '#' },
]

const ACCESSIBILITY_TAGS = [
    'Mobility', 'Vision', 'Sensory', 'Neurodivergent',
    'Hearing', 'Fatigue', 'Photosensitive', 'Chronic Illness',
    'Wheelchair User', 'Communication',
]

function ProfileAvatar({ photoURL, size = 72 }) {
    if (photoURL) {
        return <img src={photoURL} alt="Profile" className="profile-avatar-img" />
    }
    return <UserCircle size={size} stroke="#4543C6" strokeWidth={1} />
}

export default function ProfilePage() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [saved, setSaved] = useState([])
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [editTags, setEditTags] = useState([])
    const [saveError, setSaveError] = useState('')
    const [saveSuccess, setSaveSuccess] = useState(false)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                navigate('/signin')
                return
            }

            setUser(currentUser)

            const [profileData, savedData, reviewsData] = await Promise.all([
                getProfile(currentUser.uid).catch(() => null),
                getSaved(currentUser.uid).catch(() => []),
                getReviewsByUser(currentUser.uid).catch(() => []),
            ])

            setProfile(profileData)
            setSaved(savedData)
            setReviews(reviewsData)
            setEditTags(profileData?.accessibilityPreferences ?? [])
            setLoading(false)
        })

        return unsubscribe
    }, [navigate])

    const openEdit = () => {
        setEditTags(profile?.accessibilityPreferences ?? [])
        setCurrentPassword('')
        setNewPassword('')
        setSaveError('')
        setSaveSuccess(false)
        setEditing(true)
    }

    const toggleTag = (tag) => {
        setEditTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        )
    }

    const handleSave = async () => {
        if (!user) return
        setSaveError('')
        setSaveSuccess(false)

        try {
            if (currentPassword || newPassword) {
                if (!currentPassword || !newPassword) {
                    setSaveError('Please fill in both password fields to change your password.')
                    return
                }
                const credential = EmailAuthProvider.credential(user.email, currentPassword)
                await reauthenticateWithCredential(user, credential)
                await updatePassword(user, newPassword)
                setCurrentPassword('')
                setNewPassword('')
            }

            await editProfile(user.uid, { accessibilityPreferences: editTags })
            setProfile((prev) => ({ ...prev, accessibilityPreferences: editTags }))
            setSaveSuccess(true)
        } catch (err) {
            setSaveError(
                err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential'
                    ? 'Current password is incorrect.'
                    : 'Failed to save changes. Please try again.'
            )
        }
    }

    const handleSignOut = async () => {
        await signOut(auth)
        navigate('/')
    }

    if (loading) return null

    return (
        <div className="profile-page">
            <Header navItems={navItems} />

            <main className="profile-content">
                {editing ? (
                    <EditMode
                        user={user}
                        currentPassword={currentPassword}
                        newPassword={newPassword}
                        editTags={editTags}
                        saveError={saveError}
                        saveSuccess={saveSuccess}
                        onCurrentPasswordChange={setCurrentPassword}
                        onNewPasswordChange={setNewPassword}
                        onToggleTag={toggleTag}
                        onSave={handleSave}
                        onCancel={() => setEditing(false)}
                    />
                ) : (
                    <ViewMode
                        user={user}
                        profile={profile}
                        onEdit={openEdit}
                        onSignOut={handleSignOut}
                    />
                )}

                <section className="profile-section">
                    <h2 className="profile-section__title">Saved Venues</h2>
                    {saved.length === 0 ? (
                        <p className="profile-section__empty">No saved venues yet.</p>
                    ) : (
                        <div className="venue-grid">
                            {saved.map((venue) => (
                                <VenueCard
                                    key={venue.id}
                                    venue={venue}
                                    onClick={() => navigate(`/venues/${venue.id}`)}
                                />
                            ))}
                        </div>
                    )}
                </section>

                <section className="profile-section">
                    <h2 className="profile-section__title">My Reviews</h2>
                    {reviews.length === 0 ? (
                        <p className="profile-section__empty">No reviews yet.</p>
                    ) : (
                        <div className="profile-reviews">
                            {reviews.map((review) => (
                                <article key={review.id} className="profile-review-card">
                                    <div className="profile-review-card__top">
                                        <span
                                            className="profile-review-card__venue"
                                            onClick={() => navigate(`/venues/${review.venueId}`)}
                                        >
                                            {review.venueId}
                                        </span>
                                        <span className="profile-review-card__rating">
                                            ★ {review.overallRating}
                                        </span>
                                    </div>
                                    <p className="profile-review-card__summary">{review.summary}</p>
                                    <div className="profile-review-card__footer">
                                        {review.accessNeeds?.length > 0 && (
                                            <span className="profile-review-card__tag">
                                                {review.accessNeeds[0]}
                                            </span>
                                        )}
                                        <p className="profile-review-card__date">
                                            {review.dateOfVisit?.month}/{review.dateOfVisit?.day}/{review.dateOfVisit?.year}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    )
}

function ViewMode({ user, profile, onEdit, onSignOut }) {
    return (
        <div className="profile-view">
            <div className="profile-view__avatar">
                <ProfileAvatar photoURL={user?.photoURL} size={120} />
            </div>

            <h1 className="profile-view__name">
                {profile?.name ?? user?.displayName ?? 'Anonymous'}
            </h1>
            <p className="profile-view__email">{profile?.email ?? user?.email}</p>

            {profile?.accessibilityPreferences?.length > 0 && (
                <div className="profile-view__tags">
                    {profile.accessibilityPreferences.map((tag) => (
                        <span key={tag} className="profile-view__tag">{tag}</span>
                    ))}
                </div>
            )}

            <div className="profile-view__actions">
                <button className="btn-solid" type="button" onClick={onEdit}>
                    Edit Profile
                </button>
                <button className="btn-outline" type="button" onClick={onSignOut}>
                    Sign Out
                </button>
            </div>
        </div>
    )
}

function EditMode({
    user,
    currentPassword,
    newPassword,
    editTags,
    saveError,
    saveSuccess,
    onCurrentPasswordChange,
    onNewPasswordChange,
    onToggleTag,
    onSave,
    onCancel,
}) {
    return (
        <>
            <div className="profile-edit">
                <div className="profile-edit__left">
                    <div className="profile-edit__avatar">
                        <ProfileAvatar photoURL={user?.photoURL} size={140} />
                    </div>
                    <button className="profile-edit__photo-btn" type="button">
                        Edit Profile Photo <span className="profile-edit__pencil">✏</span>
                    </button>
                </div>

                <div className="profile-edit__right">
                    <h2 className="profile-edit__section-title">Edit Account Information</h2>

                    <div className="profile-edit__field">
                        <label className="profile-edit__label">Current Password</label>
                        <input
                            className="profile-edit__input"
                            type="password"
                            placeholder="Password"
                            value={currentPassword}
                            onChange={(e) => onCurrentPasswordChange(e.target.value)}
                        />
                    </div>

                    <div className="profile-edit__field">
                        <label className="profile-edit__label">New Password</label>
                        <input
                            className="profile-edit__input"
                            type="password"
                            placeholder="Confirm Password"
                            value={newPassword}
                            onChange={(e) => onNewPasswordChange(e.target.value)}
                        />
                    </div>

                    <h2 className="profile-edit__section-title profile-edit__section-title--tags">
                        Edit Profile Accessibility Tags
                    </h2>

                    <div className="profile-edit__tags">
                        {ACCESSIBILITY_TAGS.map((tag) => {
                            const isSelected = editTags.includes(tag)
                            return (
                                <button
                                    key={tag}
                                    type="button"
                                    className={`profile-edit__tag${isSelected ? ' profile-edit__tag--active' : ''}`}
                                    onClick={() => onToggleTag(tag)}
                                >
                                    {tag} {isSelected ? '−' : '+'}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {saveError && <p className="profile-edit__error">{saveError}</p>}
            {saveSuccess && <p className="profile-edit__success">Changes saved!</p>}

            <div className="profile-edit__save-row">
                <button className="btn-outline profile-edit__cancel-btn" type="button" onClick={onCancel}>
                    Cancel
                </button>
                <button className="btn-solid profile-edit__save-btn" type="button" onClick={onSave}>
                    Save Changes
                </button>
            </div>
        </>
    )
}
