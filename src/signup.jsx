import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { Eye, EyeOff } from 'lucide-react'
import { auth } from './firebase'
import { addProfile } from './db'
import Footer from './components/Footer'
import './signup.css'

const ACCESSIBILITY_TAGS = [
    'Mobility', 'Vision', 'Sensory', 'Neurodivergent',
    'Hearing', 'Fatigue', 'Photosensitive', 'Chronic Illness',
    'Wheelchair User', 'Communication',
]

export default function SignUpPage() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [username, setUsername] = useState('')
    const [selectedTags, setSelectedTags] = useState([])
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const toggleTag = (tag) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!username.trim()) {
            setError('Please enter a username.')
            return
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.')
            return
        }

        setLoading(true)
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password)
            await updateProfile(result.user, { displayName: username.trim() })
            try {
                await addProfile(result.user.uid, username.trim(), email, '', selectedTags)
            } catch (profileErr) {
                console.error('Profile creation failed:', profileErr)
                // Auth account created successfully; Firestore write failed — still proceed
            }
            navigate('/')
        } catch (err) {
            console.error('Sign up error:', err.code, err.message)
            if (err.code === 'auth/email-already-in-use') {
                setError('An account with this email already exists.')
            } else if (err.code === 'auth/operation-not-allowed') {
                setError('Email/password sign-up is not enabled. Please contact support.')
            } else if (err.code === 'auth/invalid-email') {
                setError('Please enter a valid email address.')
            } else {
                setError(`Could not create account: ${err.message}`)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="signup-page">
            <main className="signup-page__content">
                <div className="signup-page__left">
                    <h2 className="signup-page__section-title">Basic Account Information</h2>

                    <form className="signup-page__form" id="signup-form" onSubmit={handleSubmit}>
                        <div className="signup-page__card">
                            <div className="signup-page__field">
                                <label className="signup-page__label">Email</label>
                                <input
                                    className="signup-page__input"
                                    type="email"
                                    placeholder="example@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="signup-page__field">
                                <label className="signup-page__label">Password</label>
                                <div className="pw-wrap">
                                    <input
                                        className="signup-page__input"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button type="button" className="pw-toggle" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>

                            <div className="signup-page__field">
                                <label className="signup-page__label">Confirm Password</label>
                                <div className="pw-wrap">
                                    <input
                                        className="signup-page__input"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <button type="button" className="pw-toggle" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>

                            <div className="signup-page__field">
                                <label className="signup-page__label">Username</label>
                                <input
                                    className="signup-page__input"
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="signup-page__right">
                    <h2 className="signup-page__section-title">Add Accessibility Tags to Your Profile</h2>

                    <div className="signup-page__tags">
                        {ACCESSIBILITY_TAGS.map((tag) => {
                            const isSelected = selectedTags.includes(tag)
                            return (
                                <button
                                    key={tag}
                                    type="button"
                                    className={`signup-page__tag${isSelected ? ' signup-page__tag--active' : ''}`}
                                    onClick={() => toggleTag(tag)}
                                >
                                    {tag} {isSelected ? '−' : '+'}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </main>

            {error && <p className="signup-page__error">{error}</p>}

            <div className="signup-page__actions">
                <Link to="/signin" className="signup-page__back-btn">
                    Back To Sign In
                </Link>
                <button
                    className="signup-page__create-btn"
                    type="submit"
                    form="signup-form"
                    disabled={loading}
                >
                    {loading ? 'Creating…' : 'Create Account'}
                </button>
            </div>

            <Footer />
        </div>
    )
}
