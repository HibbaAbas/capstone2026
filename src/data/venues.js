export const venues = [
    {
        id: 1,
        name: 'Paramount Theatre',
        address: '911 Pine St, Seattle, WA',
        rating: 4.2,
        image:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Paramount_Theatre_Seattle.jpg/640px-Paramount_Theatre_Seattle.jpg',

        // AI-assisted: helper tags for scripted Explore search/filter behavior
        searchTags: ['theater', 'theatre'],
        accessibilityTags: [],
    },
    {
        id: 2,
        name: 'T-Mobile Park',
        address: '1250 1st Ave S, Seattle, WA',
        rating: 4.1,
        image:
            'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop',
        searchTags: ['stadium', 'sports'],
        accessibilityTags: [],
    },
    {
        id: 3,
        name: 'Lumen Field',
        address: '800 Occidental Ave S, Seattle, WA',
        rating: 4.3,
        image:
            'https://images.unsplash.com/photo-1547347298-4074fc3086f0?q=80&w=1200&auto=format&fit=crop',
        searchTags: ['stadium', 'sports'],
        accessibilityTags: [],
    },
    {
        id: 4,
        name: 'WaMu Theater',
        address: '800 Occidental Ave S, Seattle, WA',
        rating: 4.0,
        image:
            'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1200&auto=format&fit=crop',
        searchTags: ['theater'],
        accessibilityTags: ['ADA Seating'],
    },
    {
        id: 5,
        name: 'The Showbox',
        address: '1426 1st Ave, Seattle, WA',
        rating: 4.1,
        image:
            'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop',
        searchTags: ['music venue', 'concert'],
        accessibilityTags: [],
    },
    {
        id: 6,
        name: 'The Crocodile',
        address: '2505 1st Ave, Seattle, WA',
        rating: 4.2,
        image:
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop',
        searchTags: ['music venue', 'concert'],
        accessibilityTags: [],
    },
    {
        id: 7,
        name: 'Regal Meridian',
        address: '1501 7th Ave, Seattle, WA',
        rating: 4.0,
        image:
            'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop',
        searchTags: ['theater', 'movie theater', 'cinema'],
        accessibilityTags: [],
    },
    {
        id: 8,
        name: 'Seattle Art Museum',
        address: '1300 1st Ave, Seattle, WA',
        rating: 4.4,
        image:
            'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
        searchTags: ['museum', 'art'],
        accessibilityTags: [],
    },
]

export function getVenueById(venueId) {
    return venues.find((venue) => String(venue.id) === String(venueId))
}