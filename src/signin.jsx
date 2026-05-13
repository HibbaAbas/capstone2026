import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { Eye, EyeOff } from 'lucide-react'
import { auth } from './firebase'
import Footer from './components/Footer'
import logoPng from './assets/logo.png'
import './signin.css'

export default function SignInPage() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await signInWithEmailAndPassword(auth, email, password)
            navigate('/')
        } catch {
            setError('Invalid email or password. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="signin-page">
            <div className="signin-page__content">
                <div className="signin-page__left">
                    <Link to="/" className="signin-page__logo-link">
                        <img src={logoPng} alt="SEA Access" className="signin-page__logo" />
                    </Link>

                    <div className="signin-page__form-wrap">
                        <h1 className="signin-page__heading">Welcome Back!</h1>

                        <div className="signin-page__card">
                            <form className="signin-page__form" onSubmit={handleSubmit}>
                                <div className="signin-page__field">
                                    <label className="signin-page__label">Email</label>
                                    <input
                                        className="signin-page__input"
                                        type="email"
                                        placeholder="Email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="signin-page__field">
                                    <label className="signin-page__label">Password</label>
                                    <div className="pw-wrap">
                                        <input
                                            className="signin-page__input"
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

                                {error && <p className="signin-page__error">{error}</p>}

                                <button className="signin-page__submit" type="submit" disabled={loading}>
                                    {loading ? 'Signing in…' : 'Sign In'}
                                </button>
                            </form>
                        </div>

                        <button className="signin-page__forgot" type="button">
                            Forgot password?
                        </button>

                        <p className="signin-page__signup-prompt">
                            Don't have an account?{' '}
                            <Link to="/signup" className="signin-page__signup-link">Sign Up</Link>
                        </p>
                    </div>
                </div>

                <div className="signin-page__right" />
            </div>

            <Footer />
        </div>
    )
}
