export const venues = [
    {
        id: 1,
        name: 'Paramount Theatre',
        address: '911 Pine St, Seattle, WA',
        rating: 4.2,
        reviewCount: 25,
        image:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Paramount_Theatre_Seattle.jpg/640px-Paramount_Theatre_Seattle.jpg',
    },
    {
        id: 2,
        name: 'T-Mobile Park',
        address: '1250 1st Ave S, Seattle, WA',
        rating: 4.1,
        reviewCount: 18,
        image:
            'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=1200&auto=format&fit=crop',
    },
    {
        id: 3,
        name: 'Lumen Field',
        address: '800 Occidental Ave S, Seattle, WA',
        rating: 4.3,
        reviewCount: 32,
        image:
            'https://images.unsplash.com/photo-1547347298-4074fc3086f0?q=80&w=1200&auto=format&fit=crop',
    },
    {
        id: 4,
        name: 'WaMu Theater',
        address: '800 Occidental Ave S, Seattle, WA',
        rating: 4.0,
        reviewCount: 14,
        image:
            'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1200&auto=format&fit=crop',
    },
    {
        id: 5,
        name: 'The Showbox',
        address: '1426 1st Ave, Seattle, WA',
        rating: 4.4,
        reviewCount: 21,
        image:
            'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop',
    },
    {
        id: 6,
        name: 'The Crocodile',
        address: '2505 1st Ave, Seattle, WA',
        rating: 4.2,
        reviewCount: 19,
        image:
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop',
    },
]

export function getVenueById(venueId) {
    return venues.find((venue) => String(venue.id) === String(venueId))
}