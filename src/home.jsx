import Header from "./components/Header"
import Footer from "./components/Footer"
import VenueCard from "./components/VenueCard"
import { Search } from "lucide-react"
import { useNavigate } from 'react-router-dom'
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
                        />
                        <Search size={18} className="search-bar__icon" />
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