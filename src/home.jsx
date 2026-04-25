// for testing purposes
import Header from "./components/Header"
import Footer from "./components/Footer"
import VenueCard from "./components/VenueCard"
import { Search } from "lucide-react"
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useState } from "react"
import { venues } from './data/venues'
import "./home.css"

const navItems = [
    { label: "Explore", href: "/explore" },
    { label: "About", href: "#" },
    { label: "Request", href: "#" },
]

const filters = [
    "Elevator",
    "Wheelchair",
    "ADA Staff",
    "Accessible Bathroom",
    "Sensory Room",
]

export default function HomePage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [query, setQuery] = useState("")

    const handleSearch = () => {
        const params = new URLSearchParams()
        if (query.trim()) params.set("q", query.trim())
        navigate(`/explore?${params.toString()}`)
    }

    return (
        <div className="home-page">
            <Header navItems={navItems} />

            <section className="hero">
                <h1 className="hero__heading">
                    Find and share accessibility experiences
                </h1>

                <div className="hero__search-row">
                    <div className="search-bar">
                        <input
                            type="search"
                            placeholder="Search venues and categories..."
                            className="search-bar__input"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                        <Search size={18} className="search-bar__icon" onClick={handleSearch} style={{ cursor: "pointer" }} />
                    </div>

                    <button
                        className="view-all-filters-btn"
                        type="button"
                        onClick={() => navigate('/explore/filter')}
                    >
                        View All Filters
                    </button>
                </div>

                <div className="quick-filters">
                    {filters.map((f) => (
                        <button key={f} className="quick-filter-chip">
                            {f} +
                        </button>
                    ))}
                </div>
            </section>

            <section className="popular-venues">
                <div className="popular-venues__inner">
                    <h2 className="popular-venues__title">Popular Venues</h2>

                    <div className="venue-grid">
                        {venues.map((venue) => (
                            <VenueCard
                                key={venue.id}
                                venue={venue}
                                onClick={() => navigate(`/venues/${venue.id}`)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}