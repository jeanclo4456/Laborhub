import { useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Hammer, Wrench, Zap, PaintBucket, Layers, HardHat, LayoutGrid, Trash2, Users, Wind, MoreHorizontal,
  MapPin, Star, MessageCircle, Bell, Calendar, Clock, Camera, Check, X, Filter, Search, Heart,
  ChevronRight, ChevronDown, Globe, Truck, Home, User, Briefcase, DollarSign, Plus, ArrowLeft, Send,
  TrendingUp, BadgeCheck, Settings, HelpCircle, LogOut, Lock, Eye, Pause, Award, ShieldCheck, Navigation
} from 'lucide-react';

// ---------------------------------------------------------------------------
// LaborHub — prototipo de frontend interactivo con datos de muestra.
// No incluye backend real, procesador de pagos, mapas geográficos reales
// ni notificaciones push funcionales. Ver mensaje de cierre para el alcance.
// ---------------------------------------------------------------------------

const SPECIALTIES = [
  { id: 'plumbing', es: 'Plomería', en: 'Plumbing', icon: Wrench },
  { id: 'carpentry', es: 'Carpintería', en: 'Carpentry', icon: Hammer },
  { id: 'electrical', es: 'Electricidad', en: 'Electrical', icon: Zap },
  { id: 'painting', es: 'Pintura', en: 'Painting', icon: PaintBucket },
  { id: 'drywall', es: 'Drywall', en: 'Drywall', icon: Layers },
  { id: 'roofing', es: 'Roofing', en: 'Roofing', icon: HardHat },
  { id: 'tile', es: 'Tile', en: 'Tile', icon: LayoutGrid },
  { id: 'demolition', es: 'Demolición', en: 'Demolition', icon: Trash2 },
  { id: 'general', es: 'Ayudante general', en: 'General helper', icon: Users },
  { id: 'hvac', es: 'HVAC', en: 'HVAC', icon: Wind },
  { id: 'other', es: 'Otros oficios', en: 'Other trades', icon: MoreHorizontal },
];

const CITIES = ['Nueva York', 'Nueva Jersey', 'Florida', 'Texas', 'California'];

const LANGUAGES = [
  'Español', 'Inglés', 'Portugués', 'Polaco', 'Criollo Haitiano', 'Ruso', 'Francés',
  'Mandarín', 'Italiano', 'Árabe', 'Ucraniano', 'Vietnamita', 'Albanés',
];

const CERTIFICATIONS = [
  'OSHA 10', 'OSHA 30', 'EPA Certification', 'Journeyman', 'Licensed Electrician', 'Licensed Plumber',
  'HVAC Certified', 'CDL', 'Forklift Certification', 'Scissor Lift', 'Boom Lift', 'First Aid', 'CPR',
];

const TOOLS = [
  'Taladro', 'Sierra circular', 'Compresor', 'Escalera', 'Generador', 'Soldadora',
  'Herramientas de plomería', 'Herramientas eléctricas', 'Herramientas HVAC',
  'Herramientas de drywall', 'Herramientas de roofing',
];

const VEHICLES = ['Pickup', 'Van', 'Cargo Van', 'Camión', 'SUV', 'Sedán', 'Sin vehículo'];

const PORTFOLIO_CATEGORIES = [
  { id: 'before', es: 'Antes', en: 'Before' },
  { id: 'after', es: 'Después', en: 'After' },
  { id: 'recent', es: 'Trabajos recientes', en: 'Recent jobs' },
];

const WORKER_STATUSES = [
  { id: 'available', es: 'Disponible', en: 'Available', color: 'bg-stone-900', dotColor: 'bg-amber-400', beacon: true },
  { id: 'enroute', es: 'En camino', en: 'On the way', color: 'bg-slate-700', icon: Truck },
  { id: 'working', es: 'Trabajando', en: 'Working', color: 'bg-orange-700', icon: Hammer },
  { id: 'resting', es: 'Descansando', en: 'Resting', color: 'bg-stone-400', icon: Pause },
  { id: 'unavailable', es: 'No disponible', en: 'Unavailable', color: 'bg-stone-200', icon: null },
];

const BADGE_DEFS = [
  { id: 'top', es: 'Top Worker', en: 'Top Worker', icon: Star, color: 'bg-amber-100 text-amber-700', check: (s) => s.rating >= 4.8 },
  { id: 'jobs100', es: '+100 trabajos', en: '100+ jobs', icon: Award, color: 'bg-stone-900 text-amber-400', check: (s) => s.jobsDone >= 100 },
  { id: 'fast', es: 'Responde rápido', en: 'Fast responder', icon: Zap, color: 'bg-blue-100 text-blue-700', check: (s) => s.avgResponseMinutes <= 15 },
  { id: 'reliable', es: 'Nunca cancela', en: 'Never cancels', icon: ShieldCheck, color: 'bg-emerald-100 text-emerald-700', check: (s) => s.cancellationRate === 0 },
  { id: 'punctual', es: 'Excelente puntualidad', en: 'Excellent punctuality', icon: Clock, color: 'bg-slate-100 text-slate-700', check: (s) => s.punctuality >= 95 },
  { id: 'popular', es: 'Muy solicitado', en: 'Highly requested', icon: TrendingUp, color: 'bg-rose-100 text-rose-700', check: (s) => s.popular === true },
];

function getWorkerLevel(jobsDone, lang) {
  const levels = lang === 'es'
    ? ['Nuevo', 'Con experiencia', 'Profesional', 'Experto', 'Elite']
    : ['New', 'Experienced', 'Professional', 'Expert', 'Elite'];
  if (jobsDone >= 250) return levels[4];
  if (jobsDone >= 100) return levels[3];
  if (jobsDone >= 50) return levels[2];
  if (jobsDone >= 10) return levels[1];
  return levels[0];
}

function getEarnedBadges(stats) {
  return BADGE_DEFS.filter(b => b.check(stats));
}

const FREE_FAVORITES_LIMIT = 3;

const LOCATIONS = [
  // Nueva York
  { id: 1, chain: 'Home Depot', name: 'Home Depot - Flushing', address: '131-35 Avery Ave, Flushing, NY 11355', city: 'Nueva York', workers: 8, lat: 40.7614, lng: -73.8203 },
  { id: 2, chain: 'Home Depot', name: 'Home Depot - Long Island City', address: '50-10 Northern Blvd, Long Island City, NY 11101', city: 'Nueva York', workers: 6, lat: 40.7477, lng: -73.9376 },
  { id: 3, chain: 'Home Depot', name: 'Home Depot - Jamaica', address: '92-30 168th St, Jamaica, NY 11433', city: 'Nueva York', workers: 5, lat: 40.7007, lng: -73.7890 },
  { id: 4, chain: 'Home Depot', name: 'Home Depot - Sunset Park', address: '550 Hamilton Ave, Brooklyn, NY 11232', city: 'Nueva York', workers: 9, lat: 40.6627, lng: -74.0046 },
  { id: 5, chain: 'Home Depot', name: 'Home Depot - Bensonhurst', address: '2970 Cropsey Ave, Brooklyn, NY 11214', city: 'Nueva York', workers: 4, lat: 40.5945, lng: -73.9962 },
  { id: 6, chain: 'Home Depot', name: 'Home Depot - South Bronx', address: '600 Exterior St, Bronx, NY 10451', city: 'Nueva York', workers: 7, lat: 40.8115, lng: -73.9276 },
  { id: 7, chain: 'Home Depot', name: 'Home Depot - Staten Island', address: '2501 Forest Ave, Staten Island, NY 10303', city: 'Nueva York', workers: 3, lat: 40.6289, lng: -74.1585 },
  { id: 29, chain: 'Home Depot', name: 'Home Depot - South Ozone Park', address: '112-20 Rockaway Blvd, South Ozone Park, NY 11420', city: 'Nueva York', workers: 9, lat: 40.6762, lng: -73.8125 },
  // Long Island (Nassau) - Home Depot
  { id: 35, chain: 'Home Depot', name: 'Home Depot - East Meadow', address: '2000 Hempstead Turnpike, East Meadow, NY 11554', city: 'Nueva York', workers: 6, lat: 40.7157, lng: -73.5590 },
  { id: 36, chain: 'Home Depot', name: 'Home Depot - Elmont', address: '600 Hempstead Turnpike, Elmont, NY 11003', city: 'Nueva York', workers: 5, lat: 40.6989, lng: -73.7132 },
  { id: 37, chain: 'Home Depot', name: 'Home Depot - Farmingdale', address: '202 Airport Plaza, Farmingdale, NY 11735', city: 'Nueva York', workers: 5, lat: 40.7326, lng: -73.4462 },
  // Long Island (Suffolk) - Home Depot
  { id: 38, chain: 'Home Depot', name: 'Home Depot - Commack', address: '5025 Jericho Turnpike, Commack, NY 11725', city: 'Nueva York', workers: 7, lat: 40.8429, lng: -73.2884 },
  { id: 39, chain: 'Home Depot', name: 'Home Depot - Selden', address: '401 Independence Plaza, Selden, NY 11784', city: 'Nueva York', workers: 4, lat: 40.8698, lng: -73.0459 },
  { id: 40, chain: 'Home Depot', name: 'Home Depot - Bay Shore', address: '1881 Sunrise Hwy, Bay Shore, NY 11706', city: 'Nueva York', workers: 6, lat: 40.7229, lng: -73.2454 },
  { id: 41, chain: 'Home Depot', name: 'Home Depot - Copiague', address: '1101 Sunrise Highway, Copiague, NY 11726', city: 'Nueva York', workers: 3, lat: 40.6798, lng: -73.3993 },
  { id: 42, chain: 'Home Depot', name: 'Home Depot - Riverhead', address: '1550 Old Country Road, Riverhead, NY 11901', city: 'Nueva York', workers: 4, lat: 40.9174, lng: -72.6620 },
  { id: 43, chain: 'Home Depot', name: 'Home Depot - Coram', address: '346 Middle Country Rd, Coram, NY 11727', city: 'Nueva York', workers: 5, lat: 40.8759, lng: -73.0093 },
  { id: 44, chain: 'Home Depot', name: 'Home Depot - Patchogue', address: '10 Gateway Blvd, Patchogue, NY 11772', city: 'Nueva York', workers: 4, lat: 40.7654, lng: -73.0151 },
  { id: 45, chain: 'Home Depot', name: 'Home Depot - Bellport', address: '20 Farber Drive, Bellport, NY 11713', city: 'Nueva York', workers: 3, lat: 40.7548, lng: -72.9426 },
  // Long Island - Lowe's
  { id: 46, chain: "Lowe's", name: "Lowe's - Hicksville", address: '920 South Broadway, Hicksville, NY 11801', city: 'Nueva York', workers: 4, lat: 40.7684, lng: -73.5251 },
  { id: 47, chain: "Lowe's", name: "Lowe's - Garden City", address: '700 Dibblee Dr, Garden City, NY 11530', city: 'Nueva York', workers: 3, lat: 40.7268, lng: -73.6343 },
  { id: 48, chain: "Lowe's", name: "Lowe's - Farmingdale", address: '90 Price Pkwy, Farmingdale, NY 11735', city: 'Nueva York', workers: 3, lat: 40.7423, lng: -73.4335 },
  { id: 49, chain: "Lowe's", name: "Lowe's - Commack", address: '100 Long Island Expressway, Commack, NY 11725', city: 'Nueva York', workers: 4, lat: 40.8434, lng: -73.2799 },
  { id: 50, chain: "Lowe's", name: "Lowe's - Bay Shore", address: '800 Sunrise Highway, Bay Shore, NY 11706', city: 'Nueva York', workers: 3, lat: 40.7267, lng: -73.2493 },
  { id: 51, chain: "Lowe's", name: "Lowe's - Stony Brook", address: '2150 Nesconset Highway, Stony Brook, NY 11790', city: 'Nueva York', workers: 3, lat: 40.9067, lng: -73.1321 },
  { id: 52, chain: "Lowe's", name: "Lowe's - Medford", address: '2796 Route 112, Medford, NY 11763', city: 'Nueva York', workers: 3, lat: 40.8259, lng: -72.9973 },
  // Nueva Jersey
  { id: 8, chain: 'Home Depot', name: 'Home Depot - Newark', address: '399-443 Springfield Ave, Newark, NJ 07103', city: 'Nueva Jersey', workers: 6, lat: 40.7230, lng: -74.2010 },
  { id: 9, chain: 'Home Depot', name: 'Home Depot - Elizabeth', address: '977 W Grand St, Elizabeth, NJ 07202', city: 'Nueva Jersey', workers: 5, lat: 40.6580, lng: -74.2210 },
  { id: 10, chain: 'Home Depot', name: 'Home Depot - Jersey City', address: '440 NJ-440, Jersey City, NJ 07305', city: 'Nueva Jersey', workers: 4, lat: 40.6895, lng: -74.0917 },
  { id: 11, chain: 'Home Depot', name: 'Home Depot - Linden', address: '701 W Edgar Rd, Linden, NJ 07036', city: 'Nueva Jersey', workers: 3, lat: 40.6265, lng: -74.2418 },
  { id: 12, chain: 'Home Depot', name: 'Home Depot - Union', address: '930 Springfield Rd, Union, NJ 07083', city: 'Nueva Jersey', workers: 5, lat: 40.6976, lng: -74.2632 },
  // Florida
  { id: 13, chain: 'Home Depot', name: 'Home Depot - Doral', address: '1650 NW 117th Place, Miami, FL 33182', city: 'Florida', workers: 11, lat: 25.8090, lng: -80.3733 },
  { id: 14, chain: 'Home Depot', name: 'Home Depot - Hialeah', address: '5500 NW 167th St, Hialeah, FL 33014', city: 'Florida', workers: 7, lat: 25.9187, lng: -80.2895 },
  { id: 15, chain: 'Home Depot', name: 'Home Depot - West Flagler', address: '7899 W Flagler St, Miami, FL 33144', city: 'Florida', workers: 6, lat: 25.7654, lng: -80.3181 },
  { id: 16, chain: 'Home Depot', name: 'Home Depot - Biscayne', address: '12055 Biscayne Blvd, Miami, FL 33181', city: 'Florida', workers: 4, lat: 25.8917, lng: -80.1615 },
  { id: 17, chain: 'Home Depot', name: 'Home Depot - Little Havana', address: '3030 SW 8th St, Miami, FL 33135', city: 'Florida', workers: 8, lat: 25.7658, lng: -80.2436 },
  { id: 18, chain: 'Home Depot', name: 'Home Depot - Pembroke Pines', address: '11001 Pines Blvd, Pembroke Pines, FL 33026', city: 'Florida', workers: 5, lat: 26.0056, lng: -80.3223 },
  // Texas
  { id: 19, chain: 'Home Depot', name: 'Home Depot - Westheimer', address: '8400 Westheimer Rd, Houston, TX 77063', city: 'Texas', workers: 7, lat: 29.7392, lng: -95.5147 },
  { id: 20, chain: 'Home Depot', name: 'Home Depot - West Loop', address: '5445 West Loop S, Houston, TX 77081', city: 'Texas', workers: 5, lat: 29.7147, lng: -95.4489 },
  { id: 21, chain: 'Home Depot', name: 'Home Depot - Chimney Rock', address: '11500 Chimney Rock Rd, Houston, TX 77035', city: 'Texas', workers: 4, lat: 29.6669, lng: -95.4779 },
  { id: 22, chain: 'Home Depot', name: 'Home Depot - Katy Freeway', address: '8400 Katy Fwy, Houston, TX 77024', city: 'Texas', workers: 6, lat: 29.7813, lng: -95.5122 },
  { id: 23, chain: 'Home Depot', name: 'Home Depot - North Loop', address: '999 North Loop W, Houston, TX 77008', city: 'Texas', workers: 3, lat: 29.8058, lng: -95.4147 },
  // California
  { id: 24, chain: 'Home Depot', name: 'Home Depot - Sunset Blvd', address: '5600 Sunset Blvd, Hollywood, CA 90028', city: 'California', workers: 9, lat: 34.0983, lng: -118.3267 },
  { id: 25, chain: 'Home Depot', name: 'Home Depot - Wilshire', address: '1675 Wilshire Blvd, Los Angeles, CA 90017', city: 'California', workers: 6, lat: 34.0567, lng: -118.2717 },
  { id: 26, chain: 'Home Depot', name: 'Home Depot - Highland Park', address: '2055 N Figueroa St, Los Angeles, CA 90065', city: 'California', workers: 5, lat: 34.1089, lng: -118.1978 },
  { id: 27, chain: 'Home Depot', name: 'Home Depot - Slauson', address: '1830 W Slauson Ave, Los Angeles, CA 90047', city: 'California', workers: 4, lat: 33.9887, lng: -118.3092 },
  { id: 28, chain: 'Home Depot', name: 'Home Depot - Glendale', address: '5040 San Fernando Rd, Glendale, CA 91204', city: 'California', workers: 7, lat: 34.1289, lng: -118.2645 },
  // Lowe's
  { id: 30, chain: "Lowe's", name: "Lowe's - Park Slope", address: '118 2nd Ave, Brooklyn, NY 11215', city: 'Nueva York', workers: 4, lat: 40.6738, lng: -73.9857 },
  { id: 31, chain: "Lowe's", name: "Lowe's - Jersey City", address: '727 NJ-440, Jersey City, NJ 07304', city: 'Nueva Jersey', workers: 3, lat: 40.7009, lng: -74.0776 },
  { id: 32, chain: "Lowe's", name: "Lowe's - Westchester", address: '8859 SW 24th St, Miami, FL 33165', city: 'Florida', workers: 5, lat: 25.7473, lng: -80.3553 },
  { id: 33, chain: "Lowe's", name: "Lowe's - Energy Corridor", address: '2610 S Kirkwood Rd, Houston, TX 77077', city: 'Texas', workers: 4, lat: 29.7397, lng: -95.6435 },
  { id: 34, chain: "Lowe's", name: "Lowe's - Mid-City", address: '4550 W Pico Blvd, Los Angeles, CA 90019', city: 'California', workers: 3, lat: 34.0486, lng: -118.3267 },
];

const CITY_CENTERS = {
  'Nueva York': { lat: 40.78, lng: -73.4, zoom: 9 },
  'Nueva Jersey': { lat: 40.69, lng: -74.19, zoom: 10 },
  'Florida': { lat: 25.86, lng: -80.28, zoom: 10 },
  'Texas': { lat: 29.74, lng: -95.47, zoom: 10 },
  'California': { lat: 34.06, lng: -118.26, zoom: 10 },
};

const WORKERS = [
  { id: 1, name: 'Miguel Torres', initials: 'MT', color: 'bg-orange-500', specialties: ['plumbing', 'general'], experience: 8, languages: ['Español', 'Inglés'], certifications: ['OSHA 10', 'CPR'], tools: ['Herramientas de plomería', 'Taladro', 'Escalera'], vehicle: 'Van', canTransportTools: true, hourlyRate: 28, dailyRate: 210, rating: 4.9, reviewCount: 47, jobsDone: 142, punctuality: 97, avgResponseMinutes: 6, cancellationRate: 0, popular: true, city: 'Nueva York', location: 'Home Depot - Flushing', availableNow: true, availableDays: [true, true, true, true, true, true, false], verified: true, featured: true },
  { id: 2, name: 'Carlos Ramírez', initials: 'CR', color: 'bg-emerald-600', specialties: ['carpentry', 'drywall'], experience: 5, languages: ['Español'], certifications: ['OSHA 10'], tools: ['Sierra circular', 'Taladro', 'Herramientas de drywall'], vehicle: 'Pickup', canTransportTools: true, hourlyRate: 24, dailyRate: 185, rating: 4.7, reviewCount: 31, jobsDone: 68, punctuality: 92, avgResponseMinutes: 18, cancellationRate: 3, popular: false, city: 'Nueva Jersey', location: 'Home Depot - Jersey City', availableNow: false, availableDays: [false, true, true, true, true, false, false], verified: true, featured: false },
  { id: 3, name: 'Luis Fernández', initials: 'LF', color: 'bg-slate-600', specialties: ['electrical', 'hvac'], experience: 12, languages: ['Español', 'Inglés'], certifications: ['Licensed Electrician', 'HVAC Certified', 'OSHA 30'], tools: ['Herramientas eléctricas', 'Herramientas HVAC', 'Escalera'], vehicle: 'Cargo Van', canTransportTools: true, hourlyRate: 35, dailyRate: 260, rating: 5.0, reviewCount: 89, jobsDone: 215, punctuality: 99, avgResponseMinutes: 4, cancellationRate: 0, popular: true, city: 'Florida', location: 'Home Depot - Doral', availableNow: true, availableDays: [true, true, true, true, true, true, true], verified: true, featured: true },
  { id: 4, name: 'José Martínez', initials: 'JM', color: 'bg-amber-600', specialties: ['painting', 'drywall'], experience: 4, languages: ['Español'], certifications: [], tools: ['Herramientas de drywall'], vehicle: 'Sin vehículo', canTransportTools: false, hourlyRate: 20, dailyRate: 150, rating: 4.5, reviewCount: 18, jobsDone: 34, punctuality: 88, avgResponseMinutes: 25, cancellationRate: 6, popular: false, city: 'Texas', location: 'Home Depot - Westheimer', availableNow: true, availableDays: [true, false, true, false, true, false, true], verified: false, featured: false },
  { id: 5, name: 'Ana Gómez', initials: 'AG', color: 'bg-rose-500', specialties: ['tile', 'demolition'], experience: 6, languages: ['Español', 'Inglés', 'Mandarín'], certifications: ['OSHA 10', 'First Aid'], tools: ['Taladro', 'Compresor'], vehicle: 'SUV', canTransportTools: true, hourlyRate: 26, dailyRate: 195, rating: 4.8, reviewCount: 54, jobsDone: 91, punctuality: 95, avgResponseMinutes: 12, cancellationRate: 1, popular: false, city: 'California', location: 'Home Depot - Sunset Blvd', availableNow: false, availableDays: [false, true, true, true, true, true, false], verified: true, featured: false },
  { id: 6, name: 'Roberto Díaz', initials: 'RD', color: 'bg-stone-600', specialties: ['roofing', 'general'], experience: 10, languages: ['Español', 'Ruso'], certifications: ['OSHA 10'], tools: ['Herramientas de roofing'], vehicle: 'Pickup', canTransportTools: true, hourlyRate: 27, dailyRate: 200, rating: 4.6, reviewCount: 39, jobsDone: 88, punctuality: 90, avgResponseMinutes: 20, cancellationRate: 4, popular: false, city: 'Nueva York', location: 'Home Depot - Long Island City', availableNow: true, availableDays: [true, true, true, true, true, false, false], verified: true, featured: false },
  { id: 7, name: 'David Sánchez', initials: 'DS', color: 'bg-teal-600', specialties: ['plumbing', 'hvac'], experience: 15, languages: ['Español', 'Inglés', 'Criollo Haitiano'], certifications: ['Licensed Plumber', 'HVAC Certified', 'CDL', 'CPR'], tools: ['Herramientas de plomería', 'Herramientas HVAC', 'Generador'], vehicle: 'Camión', canTransportTools: true, hourlyRate: 32, dailyRate: 240, rating: 4.9, reviewCount: 102, jobsDone: 203, punctuality: 98, avgResponseMinutes: 5, cancellationRate: 0, popular: true, city: 'Florida', location: 'Home Depot - Doral', availableNow: false, availableDays: [true, true, false, true, true, true, true], verified: true, featured: true },
];

const WORKER_CONVERSATIONS = [
  { id: 101, name: 'Andrew Miller', subtitle: 'Miller Construction LLC', lastMessage: '¿Sigues disponible mañana para pintura?', time: '9:41 AM' },
  { id: 102, name: 'Frank Ostrowski', subtitle: 'FO Renovations', lastMessage: 'Perfecto, te veo a las 7:30', time: 'Ayer' },
];

const CONTRACTOR_CONVERSATIONS = [
  { id: 1, name: 'Miguel Torres', subtitle: 'Plomería · Ayudante general', lastMessage: 'Sí, disponible desde las 7am', time: '9:42 AM' },
  { id: 3, name: 'Luis Fernández', subtitle: 'Electricidad · HVAC', lastMessage: 'Perfecto, nos vemos en Home Depot Doral', time: 'Ayer' },
];

const SAMPLE_REVIEWS = {
  es: [
    { author: 'Andrew M. (Contratista)', text: 'Llegó puntual y trabajó muy rápido. Lo volvería a contratar sin duda.', stars: 5 },
    { author: 'Patricia R. (Contratista)', text: 'Buen trabajo, aunque tardó un poco más de lo esperado en terminar.', stars: 4 },
  ],
  en: [
    { author: 'Andrew M. (Contractor)', text: 'Showed up on time and worked fast. Would hire again without question.', stars: 5 },
    { author: 'Patricia R. (Contractor)', text: 'Good work, though it took a bit longer than expected to finish.', stars: 4 },
  ],
};

const SAMPLE_HISTORY = [
  { desc: 'Instalación de piso — Home Depot Doral', amount: 260 },
  { desc: 'Pintura interior — Home Depot Queens Blvd', amount: 190 },
  { desc: 'Reparación de drywall — Home Depot Newark Ave', amount: 175 },
];

const translations = {
  es: {
    appName: 'LaborHub',
    onboardEyebrow: 'Mano de obra bajo demanda',
    tagline: 'Del estacionamiento de Home Depot a tu teléfono. Conecta con trabajo o mano de obra confiable, hoy.',
    imWorker: 'Encontrar trabajo',
    imContractor: 'Contratar trabajadores',
    home: 'Inicio', profile: 'Perfil', map: 'Mapa', messages: 'Mensajes', search: 'Buscar', favorites: 'Favoritos',
    homeEyebrow: 'Tu panel', statusEyebrow: 'Tu estado',
    availableNow: 'Disponible ahora', unavailable: 'No disponible',
    activeSubtext: 'Contratistas cercanos pueden verte y enviarte solicitudes',
    inactiveSubtext: 'Actívalo para recibir solicitudes de trabajo',
    yourMeetingPoint: 'Tu punto de encuentro', change: 'Cambiar',
    statsCompletedJobs: 'Trabajos hechos', statsWeekEarnings: 'Este mes', statsRating: 'Calificación',
    incomingRequests: 'Solicitudes de trabajo', noRequests: 'Activa tu disponibilidad para empezar a recibir solicitudes',
    accept: 'Aceptar', reject: 'Rechazar', accepted: 'Aceptado', rejected: 'Rechazado',
    today: 'Hoy', tomorrow: 'Mañana', thisWeek: 'Esta semana', reviewsWord: 'reseñas',
    nameLabel: 'Nombre completo', phoneLabel: 'Teléfono de contacto',
    specialties: 'Especialidades', yearsExperience: 'Años de experiencia', languages: 'Idiomas',
    ownTransport: 'Transporte propio', ownTools: 'Herramientas propias',
    hourlyRate: 'Tarifa por hora', dailyRate: 'Tarifa diaria', availability: 'Disponibilidad semanal',
    meetingPoint: 'Punto de encuentro', portfolio: 'Trabajos anteriores',
    save: 'Guardar cambios', savedConfirmation: '✓ Perfil actualizado',
    searchPlaceholder: 'Buscar por nombre...', specialtyLabel: 'Oficio', anySpecialty: 'Cualquier oficio',
    minRating: 'Calificación mínima', anyRating: 'Cualquier calificación', maxPrice: 'Precio máximo por hora',
    languageLabel: 'Idioma', anyLanguage: 'Cualquier idioma', clearFilters: 'Limpiar', applyFilters: 'Aplicar',
    premiumBannerTitle: 'Hazte Premium:', premiumBannerDesc: 'acceso prioritario a los trabajadores mejor calificados.',
    workersFoundWord: 'trabajadores encontrados', noResults: 'No se encontraron trabajadores con estos filtros',
    workerProfileTitle: 'Perfil del trabajador', yearsExpAbbr: 'años', perHour: '/hora', perDay: '/día',
    reviews: 'Reseñas', sendMessage: 'Mensaje', bookNow: 'Reservar', featured: 'Destacado',
    noFavoritesDesc: 'Aún no tienes trabajadores favoritos. Guarda perfiles desde la búsqueda.',
    workersAvailableWord: 'trabajadores disponibles', viewWorkersHere: 'Ver trabajadores aquí',
    useAsMeetingPoint: 'Usar como mi punto de encuentro', selectPinPrompt: 'Toca un punto en el mapa para ver más detalles',
    bookingModalTitle: 'Reservar trabajador', selectDate: 'Selecciona una fecha', jobDescriptionLabel: 'Descripción del trabajo',
    jobDescriptionPlaceholder: 'Ej. Necesito ayuda instalando drywall en una habitación...',
    estimatedTotal: 'Tarifa estimada', serviceFee: 'Comisión de servicio', confirmBooking: 'Confirmar reserva',
    bookingSuccessTitle: '¡Solicitud enviada!', bookingSuccessDesc: 'Le avisaremos al trabajador y te notificaremos cuando confirme.',
    close: 'Cerrar', historyLabel: 'Historial de trabajos y pagos', verificationLabel: 'Verificación de identidad',
    verifiedStatus: 'Verificado', notificationsLabel: 'Notificaciones push', helpSupportLabel: 'Ayuda y soporte',
    languageLabel2: 'Idioma de la app', switchToContractor: 'Cambiar a modo Contratista', switchToWorker: 'Cambiar a modo Trabajador',
    logout: 'Cerrar sesión', worker: 'Trabajador', contractor: 'Contratista', typeMessagePlaceholder: 'Escribe un mensaje...',
    notifSample1: 'Nueva solicitud de trabajo de Andrew Miller', notifSample2: 'Tu reserva con Miguel Torres fue confirmada',
    tapToChangePhoto: 'Toca para cambiar tu foto',
    statsProfileViews: 'Vistas', proOnlyBadge: 'Pro',
    plans: 'Planes', yourPlanLabel: 'Tu plan', planFree: 'Gratis', perMonth: '/mes',
    planWorkerPro: 'LaborHub Pro', planContractorBusiness: 'LaborHub Business',
    currentPlanBadge: 'Plan actual', subscribeButton: 'Suscribirme', downgradeButton: 'Cambiar a Gratis',
    planFeatureVisible: 'Perfil visible en búsquedas', planFeatureRequests: 'Recibe solicitudes de trabajo',
    planFeatureChatFree: 'Chat y calificaciones', planFeatureHistoryFree: 'Historial de trabajos y pagos',
    planFeatureFeatured: 'Apareces primero, con insignia Destacado', planFeatureEarlyNotif: 'Recibe las solicitudes antes que nadie',
    planFeatureStats: 'Estadísticas de tu perfil (quién te vio)', planFeatureLowerFee: 'Comisión de servicio reducida',
    planFeatureSearch: 'Buscar y filtrar trabajadores', planFeatureBook: 'Reservar trabajadores con anticipación',
    planFeatureFavLimit: 'Hasta 3 trabajadores favoritos', planFeaturePriority: 'Acceso prioritario a los mejor calificados',
    planFeatureUnlimitedFav: 'Favoritos ilimitados', planFeatureUrgent: 'Reservas urgentes garantizadas en 1 hora',
    planFeatureSupport: 'Soporte prioritario',
    favLimitNotice: 'Con el plan Gratis puedes guardar hasta 3 favoritos.', viewPlansButton: 'Ver planes',
    premiumBannerTitleWorker: 'Destaca tu perfil:', premiumBannerDescWorker: 'aparece primero y consigue más trabajo.',
    onboardQuestion: '¿Qué deseas hacer hoy?',
    vehicleLabel: 'Vehículo', canTransportToolsLabel: 'Puede transportar herramientas',
    toolsOwnedLabel: 'Herramientas que tienes', certificationsLabel: 'Certificaciones',
    anyCertificationLabel: 'Cualquier certificación', anyTool: 'Cualquier herramienta', anyVehicle: 'Cualquier vehículo',
    levelLabel: 'Nivel', badgesLabel: 'Insignias', noBadgesYet: 'Aún sin insignias — sigue trabajando para ganarlas',
    statPunctuality: 'Puntualidad', statResponseTime: 'Responde en', statCancellationRate: 'Cancelaciones',
    statMemberSince: 'Miembro desde', statHoursWorked: 'Horas trabajadas',
    statEarningsMonth: 'Ganado este mes', statEarningsYear: 'Ganado este año',
    minutesAbbr: 'min', hoursAbbr: 'hrs',
    searchNearMe: 'Buscar cerca de mí', locatingText: 'Buscando tu ubicación...',
    locationDeniedText: 'No pudimos acceder a tu ubicación. Revisa los permisos del navegador.',
    addPointButton: 'Agregar punto', customPointNamePlaceholder: 'Nombre del lugar (ej. Ferretería López)',
    addPointConfirm: 'Agregar', allCitiesWord: 'Todas', allChainsWord: 'Todas',
    milesAway: 'mi de distancia', smartSearchLabel: 'Búsqueda inteligente',
    smartSearchPlaceholder: 'Ej. "plomero con OSHA en Queens"', detectedWord: 'Detectamos',
    customChainLabel: 'Personalizado',
  },
  en: {
    appName: 'LaborHub',
    onboardEyebrow: 'On-demand skilled labor',
    tagline: 'From the Home Depot parking lot to your phone. Connect with work or reliable workers, today.',
    imWorker: 'Find work', imContractor: 'Hire workers',
    home: 'Home', profile: 'Profile', map: 'Map', messages: 'Messages', search: 'Search', favorites: 'Favorites',
    homeEyebrow: 'Your dashboard', statusEyebrow: 'Your status',
    availableNow: 'Available now', unavailable: 'Unavailable',
    activeSubtext: 'Nearby contractors can see you and send requests',
    inactiveSubtext: 'Turn it on to receive job requests',
    yourMeetingPoint: 'Your meeting point', change: 'Change',
    statsCompletedJobs: 'Jobs done', statsWeekEarnings: 'This month', statsRating: 'Rating',
    incomingRequests: 'Job requests', noRequests: 'Turn on your availability to start getting requests',
    accept: 'Accept', reject: 'Decline', accepted: 'Accepted', rejected: 'Declined',
    today: 'Today', tomorrow: 'Tomorrow', thisWeek: 'This week', reviewsWord: 'reviews',
    nameLabel: 'Full name', phoneLabel: 'Contact phone',
    specialties: 'Specialties', yearsExperience: 'Years of experience', languages: 'Languages',
    ownTransport: 'Own transportation', ownTools: 'Own tools',
    hourlyRate: 'Hourly rate', dailyRate: 'Daily rate', availability: 'Weekly availability',
    meetingPoint: 'Meeting point', portfolio: 'Past work photos',
    save: 'Save changes', savedConfirmation: '✓ Profile updated',
    searchPlaceholder: 'Search by name...', specialtyLabel: 'Trade', anySpecialty: 'Any trade',
    minRating: 'Minimum rating', anyRating: 'Any rating', maxPrice: 'Max price per hour',
    languageLabel: 'Language', anyLanguage: 'Any language', clearFilters: 'Clear', applyFilters: 'Apply',
    premiumBannerTitle: 'Go Premium:', premiumBannerDesc: 'priority access to top-rated workers.',
    workersFoundWord: 'workers found', noResults: 'No workers matched these filters',
    workerProfileTitle: 'Worker profile', yearsExpAbbr: 'years', perHour: '/hour', perDay: '/day',
    reviews: 'Reviews', sendMessage: 'Message', bookNow: 'Book', featured: 'Featured',
    noFavoritesDesc: "You don't have favorite workers yet. Save profiles from search.",
    workersAvailableWord: 'workers available', viewWorkersHere: 'View workers here',
    useAsMeetingPoint: 'Set as my meeting point', selectPinPrompt: 'Tap a pin on the map to see details',
    bookingModalTitle: 'Book worker', selectDate: 'Select a date', jobDescriptionLabel: 'Job description',
    jobDescriptionPlaceholder: 'E.g. I need help installing drywall in one room...',
    estimatedTotal: 'Estimated rate', serviceFee: 'Service fee', confirmBooking: 'Confirm booking',
    bookingSuccessTitle: 'Request sent!', bookingSuccessDesc: "We'll notify the worker and let you know when they confirm.",
    close: 'Close', historyLabel: 'Job & payment history', verificationLabel: 'Identity verification',
    verifiedStatus: 'Verified', notificationsLabel: 'Push notifications', helpSupportLabel: 'Help & support',
    languageLabel2: 'App language', switchToContractor: 'Switch to Contractor mode', switchToWorker: 'Switch to Worker mode',
    logout: 'Log out', worker: 'Worker', contractor: 'Contractor', typeMessagePlaceholder: 'Type a message...',
    notifSample1: 'New job request from Andrew Miller', notifSample2: 'Your booking with Miguel Torres was confirmed',
    tapToChangePhoto: 'Tap to change your photo',
    statsProfileViews: 'Views', proOnlyBadge: 'Pro',
    plans: 'Plans', yourPlanLabel: 'Your plan', planFree: 'Free', perMonth: '/mo',
    planWorkerPro: 'LaborHub Pro', planContractorBusiness: 'LaborHub Business',
    currentPlanBadge: 'Current plan', subscribeButton: 'Subscribe', downgradeButton: 'Switch to Free',
    planFeatureVisible: 'Visible profile in search results', planFeatureRequests: 'Receive job requests',
    planFeatureChatFree: 'Chat and ratings', planFeatureHistoryFree: 'Job & payment history',
    planFeatureFeatured: 'Appear first, with a Featured badge', planFeatureEarlyNotif: 'Get requests before anyone else',
    planFeatureStats: 'Profile stats (who viewed you)', planFeatureLowerFee: 'Lower service fee',
    planFeatureSearch: 'Search and filter workers', planFeatureBook: 'Book workers in advance',
    planFeatureFavLimit: 'Up to 3 favorite workers', planFeaturePriority: 'Priority access to top-rated workers',
    planFeatureUnlimitedFav: 'Unlimited favorites', planFeatureUrgent: 'Guaranteed urgent bookings within 1 hour',
    planFeatureSupport: 'Priority support',
    favLimitNotice: 'The Free plan allows up to 3 favorites.', viewPlansButton: 'View plans',
    premiumBannerTitleWorker: 'Feature your profile:', premiumBannerDescWorker: 'get seen first and land more work.',
    onboardQuestion: 'What do you want to do today?',
    vehicleLabel: 'Vehicle', canTransportToolsLabel: 'Can transport tools',
    toolsOwnedLabel: 'Tools you have', certificationsLabel: 'Certifications',
    anyCertificationLabel: 'Any certification', anyTool: 'Any tool', anyVehicle: 'Any vehicle',
    levelLabel: 'Level', badgesLabel: 'Badges', noBadgesYet: 'No badges yet — keep working to earn them',
    statPunctuality: 'Punctuality', statResponseTime: 'Responds within', statCancellationRate: 'Cancellation rate',
    statMemberSince: 'Member since', statHoursWorked: 'Hours worked',
    statEarningsMonth: 'Earned this month', statEarningsYear: 'Earned this year',
    minutesAbbr: 'min', hoursAbbr: 'hrs',
    searchNearMe: 'Search near me', locatingText: 'Finding your location...',
    locationDeniedText: "We couldn't access your location. Check your browser permissions.",
    addPointButton: 'Add point', customPointNamePlaceholder: 'Place name (e.g. Local hardware store)',
    addPointConfirm: 'Add', allCitiesWord: 'All', allChainsWord: 'All',
    milesAway: 'mi away', smartSearchLabel: 'Smart search',
    smartSearchPlaceholder: 'E.g. "plumber with OSHA in Queens"', detectedWord: 'We detected',
    customChainLabel: 'Custom',
  },
};

function specialtyName(id, lang) {
  const s = SPECIALTIES.find(sp => sp.id === id);
  return s ? s[lang] : id;
}

function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function chainPinColor(chain, isSelected) {
  if (isSelected) return '#1c1917';
  if (chain === "Lowe's") return '#1e40af';
  if (chain === 'Personalizado' || chain === 'Custom') return '#be123c';
  return '#78716c';
}

function createPinIcon(count, isSelected, chain) {
  const bg = chainPinColor(chain, isSelected);
  return L.divIcon({
    className: '',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="background:${bg};border-radius:9999px;padding:6px;box-shadow:0 1px 3px rgba(0,0,0,0.35);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>
        </div>
        <span style="background:white;font-size:11px;font-weight:700;padding:1px 6px;border-radius:9999px;box-shadow:0 1px 2px rgba(0,0,0,0.25);margin-top:2px;color:#44403c;white-space:nowrap;">${count}</span>
      </div>
    `,
    iconSize: [40, 52],
    iconAnchor: [20, 52],
  });
}

function createUserLocationIcon() {
  return L.divIcon({
    className: '',
    html: `
      <div style="width:16px;height:16px;border-radius:9999px;background:#f59e0b;border:3px solid white;box-shadow:0 0 0 4px rgba(245,158,11,0.35);"></div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function parseSmartSearch(text, lang) {
  const t = text.toLowerCase();
  const result = { specialty: null, certification: null, city: null };
  for (const s of SPECIALTIES) {
    if (t.includes(s.es.toLowerCase()) || t.includes(s.en.toLowerCase()) || (s.id === 'plumbing' && t.includes('plomer')) || (s.id === 'electrical' && t.includes('electric')) || (s.id === 'painting' && t.includes('pint')) || (s.id === 'carpentry' && t.includes('carpint'))) {
      result.specialty = s.id;
      break;
    }
  }
  for (const c of CERTIFICATIONS) {
    if (t.includes(c.toLowerCase())) { result.certification = c; break; }
  }
  const cityKeywords = {
    'Nueva York': ['queens', 'brooklyn', 'bronx', 'manhattan', 'staten island', 'nueva york', 'new york', 'nyc'],
    'Nueva Jersey': ['newark', 'jersey city', 'elizabeth', 'linden', 'union', 'nueva jersey', 'new jersey', 'nj'],
    'Florida': ['miami', 'doral', 'hialeah', 'pembroke pines', 'florida'],
    'Texas': ['houston', 'texas'],
    'California': ['los angeles', 'hollywood', 'glendale', 'california', 'la '],
  };
  for (const [city, keywords] of Object.entries(cityKeywords)) {
    if (keywords.some(k => t.includes(k))) { result.city = city; break; }
  }
  return result;
}

function HazardStripe() {
  return (
    <div
      className="h-2 w-full shrink-0"
      style={{ backgroundImage: 'repeating-linear-gradient(135deg, #f59e0b 0px, #f59e0b 10px, #1c1917 10px, #1c1917 20px)' }}
    />
  );
}

function Chip({ label, active, onClick, icon: Icon, activeColor }) {
  const activeClass = activeColor === 'slate' ? 'bg-slate-700 text-white border-slate-700' : 'bg-orange-600 text-white border-orange-600';
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold border shrink-0 transition-colors ${active ? activeClass : 'bg-white text-stone-600 border-stone-300'}`}>
      {Icon && <Icon size={14} />}
      {label}
    </button>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button onClick={onChange} className={`w-12 h-7 rounded-full flex items-center px-1 transition-colors shrink-0 ${checked ? 'bg-emerald-500 justify-end' : 'bg-stone-300 justify-start'}`}>
      <span className="w-5 h-5 bg-white rounded-full shadow" />
    </button>
  );
}

function StatCard({ icon: Icon, value, label, color }) {
  return (
    <div className="bg-white rounded-2xl p-3 border border-stone-200 flex-1 text-center">
      <Icon size={18} className={`mx-auto mb-1 ${color}`} />
      <div className="font-black text-stone-900 text-lg">{value}</div>
      <div className="text-xs text-stone-400">{label}</div>
    </div>
  );
}

function WorkerCard({ worker, lang, L, onSelect, isFavorite, onToggleFavorite }) {
  return (
    <div onClick={() => onSelect(worker.id)} className="bg-white rounded-2xl p-4 border border-stone-200 transform active:scale-95 transition-transform cursor-pointer">
      <div className="flex gap-3">
        <div className={`w-14 h-14 rounded-full ${worker.color} flex items-center justify-center text-white font-bold text-lg shrink-0 ${worker.featured ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}>
          {worker.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 min-w-0">
              <span className="font-bold text-stone-900 truncate">{worker.name}</span>
              {worker.verified && <BadgeCheck size={15} className="text-slate-500 shrink-0" />}
            </div>
            <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(worker.id); }} className="shrink-0">
              <Heart size={18} className={isFavorite ? 'text-rose-500' : 'text-stone-300'} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>
          <div className="flex items-center gap-1 text-sm mt-0.5">
            <Star size={14} className="text-amber-500" fill="currentColor" />
            <span className="font-semibold text-stone-700">{worker.rating}</span>
            <span className="text-stone-400">({worker.reviewCount})</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {worker.specialties.map(s => (
              <span key={s} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">{specialtyName(s, lang)}</span>
            ))}
          </div>
          <div className="flex items-center justify-between mt-2 text-sm">
            <span className="text-stone-500">{worker.location}{worker.distanceMi != null && <span className="text-slate-500 font-medium"> · {worker.distanceMi.toFixed(1)} {L.milesAway}</span>}</span>
            <span className="font-bold text-stone-900">${worker.hourlyRate}{L.perHour}</span>
          </div>
          <div className="flex gap-1.5 mt-2">
            {worker.availableNow && (
              <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> {L.availableNow}
              </div>
            )}
            {worker.featured && (
              <div className="inline-flex items-center gap-1 bg-stone-900 text-amber-400 text-xs font-semibold px-2 py-1 rounded-full">{L.featured}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LaborHubApp() {
  const [lang, setLang] = useState('es');
  const [role, setRole] = useState(null);
  const [screen, setScreen] = useState('w-home');
  const [selectedCity, setSelectedCity] = useState('Todas');
  const [mapCity, setMapCity] = useState('Nueva York');
  const [workerStatus, setWorkerStatus] = useState('unavailable');
  const [profile, setProfile] = useState({
    name: 'Jonathan Pérez',
    phone: '(347) 555-0148',
    photo: null,
    specialties: ['plumbing'],
    experience: 5,
    languages: ['Español'],
    certifications: ['OSHA 10'],
    tools: ['Taladro', 'Escalera'],
    vehicle: 'Van',
    canTransportTools: true,
    hourlyRate: 25,
    dailyRate: 190,
    meetingPoint: 'Home Depot - Flushing',
    availableDays: [false, true, true, true, true, true, true],
    jobsDone: 132,
    punctuality: 96,
    avgResponseMinutes: 8,
    cancellationRate: 0,
    memberSince: '2024',
    hoursWorked: 512,
    earningsMonth: 780,
    earningsYear: 8940,
    profileViews: 34,
    portfolioPhotos: [],
  });
  const [justSaved, setJustSaved] = useState(false);
  const [requests, setRequests] = useState([
    { id: 1, contractorName: 'Andrew Miller', job: 'Instalación de drywall', dateKey: 'today', time: '8:00 AM', rate: 220, status: 'pending' },
    { id: 2, contractorName: 'Frank Ostrowski', job: 'Ayudante de demolición', dateKey: 'tomorrow', time: '7:30 AM', rate: 180, status: 'pending' },
  ]);
  const [favorites, setFavorites] = useState([3]);
  const [showFavLimitNotice, setShowFavLimitNotice] = useState(false);
  const [workerTier, setWorkerTier] = useState('free');
  const [contractorTier, setContractorTier] = useState('free');
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [availFilter, setAvailFilter] = useState('now');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ specialty: '', minRating: 0, maxPrice: 999, language: '', certification: '', tool: '', vehicle: '' });
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const [customLocations, setCustomLocations] = useState([]);
  const [showAddPoint, setShowAddPoint] = useState(false);
  const [newPointName, setNewPointName] = useState('');
  const [mapChainFilter, setMapChainFilter] = useState('Todas');
  const [smartSearchText, setSmartSearchText] = useState('');
  const [smartSearchDetected, setSmartSearchDetected] = useState(null);
  const [portfolioCategory, setPortfolioCategory] = useState('before');
  const [bookingWorker, setBookingWorker] = useState(null);
  const [bookingStep, setBookingStep] = useState(null);
  const [bookingDate, setBookingDate] = useState('today');
  const [bookingDesc, setBookingDesc] = useState('');
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatMessages, setChatMessages] = useState({
    101: [{ from: 'them', text: '¿Sigues disponible mañana para pintura?' }, { from: 'me', text: 'Sí, disponible desde las 7am' }],
    102: [{ from: 'them', text: 'Perfecto, te veo en el Home Depot a las 7:30' }],
    1: [{ from: 'them', text: 'Hola, soy Miguel. ¿A qué hora necesita que llegue?' }, { from: 'me', text: 'A las 8am estaría perfecto' }],
    3: [{ from: 'them', text: 'Perfecto, nos vemos en Home Depot Doral' }],
  });
  const [chatInput, setChatInput] = useState('');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const L = translations[lang];
  const rootScreens = ['w-home', 'w-profile', 'c-search', 'c-favorites', 'map', 'messages', 'menu'];
  const currentTier = role === 'worker' ? workerTier : contractorTier;
  const setCurrentTier = role === 'worker' ? setWorkerTier : setContractorTier;

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      if (prev.includes(id)) return prev.filter(f => f !== id);
      if (contractorTier === 'free' && prev.length >= FREE_FAVORITES_LIMIT) {
        setShowFavLimitNotice(true);
        return prev;
      }
      return [...prev, id];
    });
  };
  const openWorkerDetail = (id) => { setSelectedWorkerId(id); setScreen('c-detail'); };
  const goToPlans = () => { setShowFavLimitNotice(false); setScreen('plans'); };

  // ---------------------------------------------------------------------
  // ONBOARDING
  // ---------------------------------------------------------------------
  const renderOnboarding = () => (
    <div className="h-full flex flex-col bg-stone-900 text-white">
      <HazardStripe />
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">{L.onboardEyebrow}</div>
        <h1 className="text-5xl font-black tracking-tight mb-3">{L.appName}</h1>
        <p className="text-stone-400 mb-8">{L.tagline}</p>
        <p className="text-white font-bold text-lg mb-4">{L.onboardQuestion}</p>
        <button onClick={() => { setRole('worker'); setScreen('w-home'); }} className="w-full bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold py-4 rounded-2xl mb-3 flex items-center justify-center gap-2 transition-colors">
          <Hammer size={18} /> {L.imWorker}
        </button>
        <button onClick={() => { setRole('contractor'); setScreen('c-search'); }} className="w-full bg-transparent border-2 border-slate-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2">
          <Briefcase size={18} /> {L.imContractor}
        </button>
      </div>
      <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="text-stone-500 text-sm py-6 text-center w-full">
        {lang === 'es' ? 'View in English' : 'Ver en Español'}
      </button>
    </div>
  );

  // ---------------------------------------------------------------------
  // TOP BAR + BOTTOM NAV
  // ---------------------------------------------------------------------
  const renderTopBar = () => (
    <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 bg-white relative shrink-0">
      <div className="flex items-center gap-2">
        <div className={`${role === 'worker' ? 'bg-orange-600' : 'bg-slate-700'} text-white rounded-lg w-8 h-8 flex items-center justify-center font-black text-sm`}>L</div>
        <span className="font-black text-stone-900 tracking-tight">{L.appName}</span>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="flex items-center gap-1 text-xs font-semibold text-stone-500 border border-stone-300 rounded-full px-2 py-1">
          <Globe size={12} /> {lang.toUpperCase()}
        </button>
        <button onClick={() => setShowNotifications(!showNotifications)} className="relative">
          <Bell size={20} className="text-stone-600" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full" />
        </button>
        <button onClick={() => setScreen('menu')}>
          <Settings size={20} className="text-stone-600" />
        </button>
      </div>
      {showNotifications && (
        <div className="absolute top-14 right-4 bg-white border border-stone-200 rounded-xl shadow-lg w-64 p-3 z-50">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">{L.notificationsLabel}</div>
          <div className="text-sm text-stone-600 mb-2 pb-2 border-b border-stone-100">{L.notifSample1}</div>
          <div className="text-sm text-stone-600">{L.notifSample2}</div>
        </div>
      )}
    </div>
  );

  const renderBottomNav = () => {
    const items = role === 'worker'
      ? [{ id: 'w-home', icon: Home, label: L.home }, { id: 'w-profile', icon: User, label: L.profile }, { id: 'map', icon: MapPin, label: L.map }, { id: 'messages', icon: MessageCircle, label: L.messages }]
      : [{ id: 'c-search', icon: Search, label: L.search }, { id: 'map', icon: MapPin, label: L.map }, { id: 'c-favorites', icon: Heart, label: L.favorites }, { id: 'messages', icon: MessageCircle, label: L.messages }];
    return (
      <div className="flex border-t border-stone-200 bg-white shrink-0">
        {items.map(item => {
          const Icon = item.icon;
          const activeItem = screen === item.id;
          return (
            <button key={item.id} onClick={() => setScreen(item.id)} className={`flex-1 flex flex-col items-center gap-0.5 py-2 ${activeItem ? (role === 'worker' ? 'text-orange-600' : 'text-slate-700') : 'text-stone-400'}`}>
              <Icon size={20} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  // ---------------------------------------------------------------------
  // WORKER: HOME
  // ---------------------------------------------------------------------
  const renderWHome = () => {
    const currentStatus = WORKER_STATUSES.find(s => s.id === workerStatus);
    const isAvailable = workerStatus === 'available';
    const myLevel = getWorkerLevel(profile.jobsDone, lang);
    const myBadges = getEarnedBadges({ rating: 4.8, jobsDone: profile.jobsDone, avgResponseMinutes: profile.avgResponseMinutes, cancellationRate: profile.cancellationRate, punctuality: profile.punctuality, popular: profile.profileViews >= 30 });

    return (
      <div className="p-4 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center font-black text-orange-700 shrink-0 overflow-hidden">
            {profile.photo ? <img src={profile.photo} alt="" className="w-14 h-14 object-cover" /> : profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">{L.homeEyebrow}</div>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">{lang === 'es' ? 'Hola' : 'Hi'}, {profile.name.split(' ')[0]}</h2>
            <div className="flex items-center gap-1 text-sm mt-1">
              <Star size={14} className="text-amber-500" fill="currentColor" />
              <span className="font-semibold text-stone-700">4.8</span>
              <span className="text-stone-400">(47 {L.reviewsWord})</span>
              <span className="text-xs font-bold bg-stone-900 text-amber-400 px-2 py-0.5 rounded-full ml-1">{myLevel}</span>
            </div>
          </div>
        </div>

        <div className={`relative rounded-3xl p-5 overflow-hidden transition-colors ${currentStatus.color}`}>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider mb-1 text-white text-opacity-60">{L.statusEyebrow}</div>
              <div className="text-xl font-black tracking-tight text-white">{currentStatus[lang]}</div>
              <div className="text-sm mt-1 text-white text-opacity-70">{isAvailable ? L.activeSubtext : L.inactiveSubtext}</div>
            </div>
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              {isAvailable && <span className="absolute inline-flex h-12 w-12 rounded-full bg-amber-400 opacity-75 animate-ping" />}
              <span className={`relative inline-flex rounded-full h-12 w-12 items-center justify-center ${isAvailable ? 'bg-amber-400' : 'bg-white bg-opacity-20'}`}>
                {isAvailable ? <span className="w-4 h-4 rounded-full bg-stone-900" /> : currentStatus.icon ? <currentStatus.icon size={22} className="text-white" /> : <span className="w-3 h-3 rounded-full bg-white bg-opacity-50" />}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {WORKER_STATUSES.map(s => {
            const Icon = s.icon;
            const isActive = workerStatus === s.id;
            return (
              <button key={s.id} onClick={() => setWorkerStatus(s.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold shrink-0 transition-colors ${isActive ? `${s.color} text-white` : 'bg-white text-stone-500 border border-stone-200'}`}>
                {s.id === 'available' ? <span className="w-2 h-2 rounded-full bg-amber-400" /> : Icon ? <Icon size={13} /> : <span className="w-2 h-2 rounded-full bg-stone-400" />}
                {s[lang]}
              </button>
            );
          })}
        </div>

        {myBadges.length > 0 && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">{L.badgesLabel}</div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {myBadges.map(b => {
                const Icon = b.icon;
                return (
                  <div key={b.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 ${b.color}`}>
                    <Icon size={13} /> {b[lang]}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-4 border border-stone-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">{L.yourMeetingPoint}</span>
            <button onClick={() => setScreen('w-profile')} className="text-orange-600 text-sm font-semibold">{L.change}</button>
          </div>
          <div className="flex items-center gap-2 text-stone-900 font-semibold">
            <MapPin size={16} className="text-orange-600" /> {profile.meetingPoint}
          </div>
        </div>

        <div className="flex gap-3">
          <StatCard icon={Briefcase} value={profile.jobsDone} label={L.statsCompletedJobs} color="text-orange-600" />
          <StatCard icon={DollarSign} value={`$${profile.earningsMonth}`} label={L.statsWeekEarnings} color="text-emerald-600" />
          <StatCard icon={Star} value="4.8" label={L.statsRating} color="text-amber-500" />
          {workerTier === 'pro' ? (
            <StatCard icon={Eye} value={profile.profileViews} label={L.statsProfileViews} color="text-slate-500" />
          ) : (
            <button onClick={goToPlans} className="bg-white rounded-2xl p-3 border border-stone-200 flex-1 text-center">
              <Lock size={18} className="mx-auto mb-1 text-stone-300" />
              <div className="font-bold text-stone-400 text-xs">{L.proOnlyBadge}</div>
              <div className="text-xs text-stone-400">{L.statsProfileViews}</div>
            </button>
          )}
        </div>

        {workerTier === 'free' && (
          <button onClick={goToPlans} className="w-full bg-stone-900 rounded-2xl p-3 flex items-center gap-3 text-left">
            <TrendingUp size={20} className="text-amber-400 shrink-0" />
            <div className="text-xs text-stone-300 flex-1"><span className="font-bold text-white">{L.premiumBannerTitleWorker}</span> {L.premiumBannerDescWorker}</div>
            <ChevronRight size={16} className="text-stone-500 shrink-0" />
          </button>
        )}

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">{L.incomingRequests}</div>
          {requests.length === 0 && (
            <div className="text-sm text-stone-400 bg-white rounded-2xl p-4 text-center border border-stone-200">{L.noRequests}</div>
          )}
          <div className="space-y-3">
            {requests.map(r => (
              <div key={r.id} className="bg-white rounded-2xl p-4 border border-stone-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-stone-900">{r.contractorName}</span>
                  <span className="font-black text-emerald-600">${r.rate}</span>
                </div>
                <div className="text-sm text-stone-600 mb-1">{r.job}</div>
                <div className="text-xs text-stone-400 mb-3">{L[r.dateKey]}, {r.time}</div>
                {r.status === 'pending' ? (
                  <div className="flex gap-2">
                    <button onClick={() => setRequests(requests.map(x => x.id === r.id ? { ...x, status: 'accepted' } : x))} className="flex-1 bg-emerald-600 text-white rounded-xl py-2 text-sm font-semibold flex items-center justify-center gap-1">
                      <Check size={15} /> {L.accept}
                    </button>
                    <button onClick={() => setRequests(requests.map(x => x.id === r.id ? { ...x, status: 'rejected' } : x))} className="flex-1 bg-stone-100 text-stone-500 rounded-xl py-2 text-sm font-semibold flex items-center justify-center gap-1">
                      <X size={15} /> {L.reject}
                    </button>
                  </div>
                ) : (
                  <div className={`text-center text-sm font-semibold rounded-xl py-2 ${r.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-50 text-stone-400'}`}>
                    {r.status === 'accepted' ? L.accepted : L.rejected}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------
  // WORKER: PROFILE
  // ---------------------------------------------------------------------
  const renderWProfile = () => {
    const toggleSpecialty = (id) => setProfile(p => ({ ...p, specialties: p.specialties.includes(id) ? p.specialties.filter(s => s !== id) : [...p.specialties, id] }));
    const toggleLanguage = (name) => setProfile(p => ({ ...p, languages: p.languages.includes(name) ? p.languages.filter(l => l !== name) : [...p.languages, name] }));
    const toggleCertification = (name) => setProfile(p => ({ ...p, certifications: p.certifications.includes(name) ? p.certifications.filter(c => c !== name) : [...p.certifications, name] }));
    const toggleTool = (name) => setProfile(p => ({ ...p, tools: p.tools.includes(name) ? p.tools.filter(t => t !== name) : [...p.tools, name] }));
    const toggleDay = (i) => setProfile(p => { const days = [...p.availableDays]; days[i] = !days[i]; return { ...p, availableDays: days }; });
    const dayLabels = lang === 'es' ? ['D', 'L', 'M', 'M', 'J', 'V', 'S'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const myLevel = getWorkerLevel(profile.jobsDone, lang);
    const handlePhotoUpload = (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => setProfile(p => ({ ...p, photo: reader.result }));
      reader.readAsDataURL(file);
    };

    return (
      <div className="p-4 space-y-5">
        <div className="flex flex-col items-center">
          <label className={`w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center relative cursor-pointer overflow-hidden ${workerTier === 'pro' ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}>
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            {profile.photo ? (
              <img src={profile.photo} alt="" className="w-24 h-24 object-cover" />
            ) : (
              <User size={36} className="text-orange-300" />
            )}
            <div className="absolute bottom-0 right-0 bg-orange-600 rounded-full p-1.5 border-2 border-white">
              <Camera size={14} className="text-white" />
            </div>
          </label>
          <span className="text-xs text-stone-400 mt-2">{L.tapToChangePhoto}</span>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1 text-sm">
              <Star size={14} className="text-amber-500" fill="currentColor" />
              <span className="font-bold text-stone-900">4.8</span>
              <span className="text-stone-400">(47 {L.reviewsWord})</span>
            </div>
            <span className="text-xs font-bold bg-stone-900 text-amber-400 px-2 py-0.5 rounded-full">{L.levelLabel}: {myLevel}</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="font-black text-stone-900">{profile.jobsDone}</div>
              <div className="text-xs text-stone-400">{L.statsCompletedJobs}</div>
            </div>
            <div>
              <div className="font-black text-stone-900">{profile.punctuality}%</div>
              <div className="text-xs text-stone-400">{L.statPunctuality}</div>
            </div>
            <div>
              <div className="font-black text-stone-900">{profile.avgResponseMinutes} {L.minutesAbbr}</div>
              <div className="text-xs text-stone-400">{L.statResponseTime}</div>
            </div>
            <div>
              <div className="font-black text-stone-900">{profile.cancellationRate}%</div>
              <div className="text-xs text-stone-400">{L.statCancellationRate}</div>
            </div>
            <div>
              <div className="font-black text-stone-900">{profile.hoursWorked} {L.hoursAbbr}</div>
              <div className="text-xs text-stone-400">{L.statHoursWorked}</div>
            </div>
            <div>
              <div className="font-black text-stone-900">{profile.memberSince}</div>
              <div className="text-xs text-stone-400">{L.statMemberSince}</div>
            </div>
            <div>
              <div className="font-black text-emerald-600">${profile.earningsMonth}</div>
              <div className="text-xs text-stone-400">{L.statEarningsMonth}</div>
            </div>
            <div>
              <div className="font-black text-emerald-600">${profile.earningsYear}</div>
              <div className="text-xs text-stone-400">{L.statEarningsYear}</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">{L.nameLabel}</label>
            <input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="w-full border border-stone-200 rounded-xl px-3 py-2 mt-1 text-stone-900" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">{L.phoneLabel}</label>
            <input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} className="w-full border border-stone-200 rounded-xl px-3 py-2 mt-1 text-stone-900" />
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">{L.specialties}</div>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map(s => (
              <Chip key={s.id} label={s[lang]} icon={s.icon} active={profile.specialties.includes(s.id)} onClick={() => toggleSpecialty(s.id)} />
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">{L.yearsExperience}</div>
          <input type="number" min="0" max="50" value={profile.experience} onChange={e => setProfile({ ...profile, experience: Number(e.target.value) })} className="w-24 border border-stone-200 rounded-xl px-3 py-2 text-stone-900" />
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">{L.languages}</div>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(lo => (
              <Chip key={lo} label={lo} active={profile.languages.includes(lo)} onClick={() => toggleLanguage(lo)} />
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">{L.certificationsLabel}</div>
          <div className="flex flex-wrap gap-2">
            {CERTIFICATIONS.map(c => (
              <Chip key={c} label={c} active={profile.certifications.includes(c)} onClick={() => toggleCertification(c)} />
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">{L.toolsOwnedLabel}</div>
          <div className="flex flex-wrap gap-2">
            {TOOLS.map(t => (
              <Chip key={t} label={t} active={profile.tools.includes(t)} onClick={() => toggleTool(t)} />
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">{L.vehicleLabel}</div>
          <div className="flex flex-wrap gap-2">
            {VEHICLES.map(v => (
              <Chip key={v} label={v} icon={Truck} active={profile.vehicle === v} onClick={() => setProfile({ ...profile, vehicle: v })} />
            ))}
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-stone-700"><Truck size={16} /> {L.canTransportToolsLabel}</div>
          <Toggle checked={profile.canTransportTools} onChange={() => setProfile({ ...profile, canTransportTools: !profile.canTransportTools })} />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">{L.hourlyRate}</label>
            <div className="flex items-center border border-stone-200 rounded-xl px-3 py-2 mt-1">
              <span className="text-stone-400 mr-1">$</span>
              <input type="number" value={profile.hourlyRate} onChange={e => setProfile({ ...profile, hourlyRate: Number(e.target.value) })} className="w-full outline-none text-stone-900" />
            </div>
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">{L.dailyRate}</label>
            <div className="flex items-center border border-stone-200 rounded-xl px-3 py-2 mt-1">
              <span className="text-stone-400 mr-1">$</span>
              <input type="number" value={profile.dailyRate} onChange={e => setProfile({ ...profile, dailyRate: Number(e.target.value) })} className="w-full outline-none text-stone-900" />
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">{L.availability}</div>
          <div className="flex gap-2">
            {dayLabels.map((d, i) => (
              <button key={i} onClick={() => toggleDay(i)} className={`w-9 h-9 rounded-full text-sm font-semibold ${profile.availableDays[i] ? 'bg-orange-600 text-white' : 'bg-stone-100 text-stone-400'}`}>{d}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">{L.meetingPoint}</label>
          <select value={profile.meetingPoint} onChange={e => setProfile({ ...profile, meetingPoint: e.target.value })} className="w-full border border-stone-200 rounded-xl px-3 py-2 mt-1 text-stone-900">
            {LOCATIONS.map(loc => <option key={loc.id} value={loc.name}>{loc.name} — {loc.city}</option>)}
          </select>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">{L.portfolio}</div>
          <div className="flex gap-2 mb-2">
            {PORTFOLIO_CATEGORIES.map(cat => (
              <Chip key={cat.id} label={cat[lang]} active={portfolioCategory === cat.id} onClick={() => setPortfolioCategory(cat.id)} />
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {profile.portfolioPhotos.filter(p => p.category === portfolioCategory).map(p => (
              <div key={p.id} className="relative shrink-0">
                <img src={p.url} alt="" className="w-24 h-24 rounded-xl object-cover" />
                <button onClick={() => setProfile(pr => ({ ...pr, portfolioPhotos: pr.portfolioPhotos.filter(x => x.id !== p.id) }))} className="absolute -top-1.5 -right-1.5 bg-stone-900 rounded-full p-1">
                  <X size={11} className="text-white" />
                </button>
              </div>
            ))}
            <label className="w-24 h-24 bg-stone-50 border-2 border-dashed border-stone-200 rounded-xl flex items-center justify-center text-stone-300 cursor-pointer shrink-0">
              <input type="file" accept="image/*" className="hidden" onChange={e => {
                const file = e.target.files && e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setProfile(pr => ({ ...pr, portfolioPhotos: [...pr.portfolioPhotos, { id: Date.now(), url: reader.result, category: portfolioCategory }] }));
                reader.readAsDataURL(file);
              }} />
              <Plus size={22} />
            </label>
          </div>
        </div>

        <button onClick={() => setJustSaved(true)} className="w-full bg-orange-600 text-white font-bold py-3 rounded-2xl">{L.save}</button>
        {justSaved && <div className="text-center text-sm text-emerald-600 font-semibold">{L.savedConfirmation}</div>}
      </div>
    );
  };

  // ---------------------------------------------------------------------
  // CONTRACTOR: SEARCH
  // ---------------------------------------------------------------------
  const renderCSearch = () => {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowDayIdx = tomorrow.getDay();

    const filtered = WORKERS.filter(w => {
      if (selectedCity !== 'Todas' && w.city !== selectedCity) return false;
      if (searchQuery && !w.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (availFilter === 'now' && !w.availableNow) return false;
      if (availFilter === 'tomorrow' && !w.availableDays[tomorrowDayIdx]) return false;
      if (filters.specialty && !w.specialties.includes(filters.specialty)) return false;
      if (filters.minRating && w.rating < filters.minRating) return false;
      if (filters.maxPrice && w.hourlyRate > filters.maxPrice) return false;
      if (filters.language && !w.languages.includes(filters.language)) return false;
      if (filters.certification && !w.certifications.includes(filters.certification)) return false;
      if (filters.tool && !w.tools.includes(filters.tool)) return false;
      if (filters.vehicle && w.vehicle !== filters.vehicle) return false;
      return true;
    }).map(w => {
      const loc = LOCATIONS.find(l => l.name === w.location);
      const distanceMi = userLocation && loc ? haversineDistanceKm(userLocation.lat, userLocation.lng, loc.lat, loc.lng) * 0.621371 : null;
      return { ...w, distanceMi };
    }).sort((a, b) => {
      if (userLocation && a.distanceMi !== null && b.distanceMi !== null) return a.distanceMi - b.distanceMi;
      return (b.featured - a.featured) || (b.rating - a.rating);
    });

    const runSmartSearch = () => {
      const detected = parseSmartSearch(smartSearchText, lang);
      setSmartSearchDetected(detected);
      if (detected.specialty) setFilters(f => ({ ...f, specialty: detected.specialty }));
      if (detected.certification) setFilters(f => ({ ...f, certification: detected.certification }));
      if (detected.city) setSelectedCity(detected.city);
    };

    return (
      <div className="p-4 space-y-3">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">{L.smartSearchLabel}</div>
          <div className="flex items-center gap-2">
            <input value={smartSearchText} onChange={e => setSmartSearchText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') runSmartSearch(); }} placeholder={L.smartSearchPlaceholder} className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-stone-900 outline-none bg-white" />
            <button onClick={runSmartSearch} className="bg-slate-700 text-white rounded-xl px-3 py-2"><Search size={16} /></button>
          </div>
          {smartSearchDetected && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-xs text-slate-500">{L.detectedWord}:</span>
              {smartSearchDetected.specialty && <span className="text-xs bg-white border border-slate-200 rounded-full px-2 py-0.5 text-slate-700">{specialtyName(smartSearchDetected.specialty, lang)}</span>}
              {smartSearchDetected.certification && <span className="text-xs bg-white border border-slate-200 rounded-full px-2 py-0.5 text-slate-700">{smartSearchDetected.certification}</span>}
              {smartSearchDetected.city && <span className="text-xs bg-white border border-slate-200 rounded-full px-2 py-0.5 text-slate-700">{smartSearchDetected.city}</span>}
              {!smartSearchDetected.specialty && !smartSearchDetected.certification && !smartSearchDetected.city && <span className="text-xs text-slate-400">—</span>}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-3 py-2">
          <Search size={16} className="text-stone-400" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={L.searchPlaceholder} className="flex-1 outline-none text-sm text-stone-900" />
          <button onClick={() => setShowFilters(!showFilters)}>
            <Filter size={18} className={showFilters ? 'text-slate-700' : 'text-stone-400'} />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {['Todas', ...CITIES].map(c => <Chip key={c} label={c === 'Todas' ? L.allCitiesWord : c} activeColor="slate" active={selectedCity === c} onClick={() => setSelectedCity(c)} />)}
        </div>

        <div className="flex gap-2">
          {['now', 'tomorrow', 'week'].map(a => (
            <Chip key={a} activeColor="slate" label={a === 'now' ? L.today : a === 'tomorrow' ? L.tomorrow : L.thisWeek} active={availFilter === a} onClick={() => setAvailFilter(a)} />
          ))}
        </div>

        {showFilters && (
          <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">{L.specialtyLabel}</label>
              <select value={filters.specialty} onChange={e => setFilters({ ...filters, specialty: e.target.value })} className="w-full border border-stone-200 rounded-xl px-3 py-2 mt-1 text-stone-900">
                <option value="">{L.anySpecialty}</option>
                {SPECIALTIES.map(s => <option key={s.id} value={s.id}>{s[lang]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">{L.minRating}</label>
              <select value={filters.minRating} onChange={e => setFilters({ ...filters, minRating: Number(e.target.value) })} className="w-full border border-stone-200 rounded-xl px-3 py-2 mt-1 text-stone-900">
                <option value="0">{L.anyRating}</option>
                <option value="4">4.0+</option>
                <option value="4.5">4.5+</option>
                <option value="4.8">4.8+</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">{L.maxPrice}</label>
              <input type="number" value={filters.maxPrice} onChange={e => setFilters({ ...filters, maxPrice: Number(e.target.value) })} className="w-full border border-stone-200 rounded-xl px-3 py-2 mt-1 text-stone-900" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">{L.languageLabel}</label>
              <select value={filters.language} onChange={e => setFilters({ ...filters, language: e.target.value })} className="w-full border border-stone-200 rounded-xl px-3 py-2 mt-1 text-stone-900">
                <option value="">{L.anyLanguage}</option>
                {LANGUAGES.map(lo => <option key={lo} value={lo}>{lo}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">{L.certificationsLabel}</label>
              <select value={filters.certification} onChange={e => setFilters({ ...filters, certification: e.target.value })} className="w-full border border-stone-200 rounded-xl px-3 py-2 mt-1 text-stone-900">
                <option value="">{L.anyCertificationLabel}</option>
                {CERTIFICATIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">{L.toolsOwnedLabel}</label>
              <select value={filters.tool} onChange={e => setFilters({ ...filters, tool: e.target.value })} className="w-full border border-stone-200 rounded-xl px-3 py-2 mt-1 text-stone-900">
                <option value="">{L.anyTool}</option>
                {TOOLS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">{L.vehicleLabel}</label>
              <select value={filters.vehicle} onChange={e => setFilters({ ...filters, vehicle: e.target.value })} className="w-full border border-stone-200 rounded-xl px-3 py-2 mt-1 text-stone-900">
                <option value="">{L.anyVehicle}</option>
                {VEHICLES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setFilters({ specialty: '', minRating: 0, maxPrice: 999, language: '', certification: '', tool: '', vehicle: '' })} className="flex-1 bg-stone-100 text-stone-500 rounded-xl py-2 text-sm font-semibold">{L.clearFilters}</button>
              <button onClick={() => setShowFilters(false)} className="flex-1 bg-slate-700 text-white rounded-xl py-2 text-sm font-semibold">{L.applyFilters}</button>
            </div>
          </div>
        )}

        {contractorTier === 'free' && (
          <button onClick={goToPlans} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center gap-3 text-left">
            <TrendingUp size={20} className="text-slate-500 shrink-0" />
            <div className="text-xs text-slate-700 flex-1"><span className="font-bold">{L.premiumBannerTitle}</span> {L.premiumBannerDesc}</div>
            <ChevronRight size={16} className="text-slate-400 shrink-0" />
          </button>
        )}

        <div className="text-xs text-stone-400">{filtered.length} {L.workersFoundWord}</div>

        <div className="space-y-3">
          {filtered.map(w => (
            <WorkerCard key={w.id} worker={w} lang={lang} L={L} onSelect={openWorkerDetail} isFavorite={favorites.includes(w.id)} onToggleFavorite={toggleFavorite} />
          ))}
          {filtered.length === 0 && <div className="text-center text-sm text-stone-400 bg-white rounded-2xl p-6 border border-stone-200">{L.noResults}</div>}
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------
  // CONTRACTOR: WORKER DETAIL
  // ---------------------------------------------------------------------
  const renderCDetail = () => {
    const w = WORKERS.find(x => x.id === selectedWorkerId);
    if (!w) return null;
    const isFav = favorites.includes(w.id);
    const wLevel = getWorkerLevel(w.jobsDone, lang);
    const wBadges = getEarnedBadges(w);
    return (
      <div>
        <div className="sticky top-0 bg-white z-10 flex items-center gap-3 p-4 border-b border-stone-200">
          <button onClick={() => setScreen('c-search')}><ArrowLeft size={20} className="text-stone-700" /></button>
          <span className="font-bold text-stone-900">{L.workerProfileTitle}</span>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-full ${w.color} flex items-center justify-center text-white font-bold text-2xl ${w.featured ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}>{w.initials}</div>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <span className="font-black text-lg text-stone-900">{w.name}</span>
                {w.verified && <BadgeCheck size={16} className="text-slate-500" />}
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Star size={14} className="text-amber-500" fill="currentColor" />
                <span className="font-semibold text-stone-700">{w.rating}</span>
                <span className="text-stone-400">({w.reviewCount} {L.reviewsWord})</span>
                <span className="text-xs font-bold bg-stone-900 text-amber-400 px-2 py-0.5 rounded-full ml-1">{wLevel}</span>
              </div>
              <div className="text-sm text-stone-500 flex items-center gap-1 mt-0.5"><MapPin size={13} /> {w.location}</div>
            </div>
            <button onClick={() => toggleFavorite(w.id)}>
              <Heart size={22} className={isFav ? 'text-rose-500' : 'text-stone-300'} fill={isFav ? 'currentColor' : 'none'} />
            </button>
          </div>

          {wBadges.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {wBadges.map(b => {
                const Icon = b.icon;
                return (
                  <div key={b.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 ${b.color}`}>
                    <Icon size={13} /> {b[lang]}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {w.specialties.map(s => <span key={s} className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-full">{specialtyName(s, lang)}</span>)}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-stone-200 rounded-2xl p-3">
              <div className="text-xs text-stone-400">{L.yearsExperience}</div>
              <div className="font-bold text-stone-900">{w.experience} {L.yearsExpAbbr}</div>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-3">
              <div className="text-xs text-stone-400">{L.languages}</div>
              <div className="font-bold text-stone-900 text-sm">{w.languages.join(', ')}</div>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-3 flex items-center gap-2">
              <Truck size={16} className={w.vehicle !== 'Sin vehículo' ? 'text-emerald-500' : 'text-stone-300'} />
              <div>
                <div className="text-sm text-stone-700">{w.vehicle}</div>
                {w.canTransportTools && <div className="text-xs text-emerald-600">{L.canTransportToolsLabel}</div>}
              </div>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-3">
              <div className="text-xs text-stone-400">{L.toolsOwnedLabel}</div>
              <div className="font-bold text-stone-900 text-sm">{w.tools.length > 0 ? w.tools.join(', ') : '—'}</div>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-3">
              <div className="text-xs text-stone-400">{L.statPunctuality}</div>
              <div className="font-bold text-stone-900">{w.punctuality}%</div>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-3">
              <div className="text-xs text-stone-400">{L.statResponseTime}</div>
              <div className="font-bold text-stone-900">{w.avgResponseMinutes} {L.minutesAbbr}</div>
            </div>
          </div>

          {w.certifications.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">{L.certificationsLabel}</div>
              <div className="flex flex-wrap gap-2">
                {w.certifications.map(c => <span key={c} className="text-xs bg-slate-50 border border-slate-200 text-slate-700 px-2 py-1 rounded-full">{c}</span>)}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <div className="flex-1 bg-slate-50 rounded-2xl p-3 text-center">
              <div className="font-black text-slate-700 text-lg">${w.hourlyRate}</div>
              <div className="text-xs text-slate-400">{L.perHour}</div>
            </div>
            <div className="flex-1 bg-slate-50 rounded-2xl p-3 text-center">
              <div className="font-black text-slate-700 text-lg">${w.dailyRate}</div>
              <div className="text-xs text-slate-400">{L.perDay}</div>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">{L.portfolio}</div>
            <div className="grid grid-cols-3 gap-2">
              {[Hammer, Wrench, PaintBucket, Layers].map((Icon, i) => (
                <div key={i} className="h-20 bg-slate-50 rounded-xl flex items-center justify-center"><Icon size={22} className="text-slate-300" /></div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">{L.reviews}</div>
            <div className="space-y-2">
              {SAMPLE_REVIEWS[lang].map((rev, i) => (
                <div key={i} className="bg-white border border-stone-200 rounded-2xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-stone-800">{rev.author}</span>
                    <div className="flex items-center gap-0.5 text-amber-500 text-xs"><Star size={12} fill="currentColor" /> {rev.stars}</div>
                  </div>
                  <div className="text-sm text-stone-600">{rev.text}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="h-16" />
        </div>

        <div className="sticky bottom-0 w-full flex gap-2 p-3 bg-white border-t border-stone-200">
          <button onClick={() => { setActiveChatId(w.id); setChatMessages(prev => prev[w.id] ? prev : { ...prev, [w.id]: [] }); setScreen('chat'); }} className="flex-1 bg-stone-100 text-stone-700 font-semibold rounded-xl py-3 flex items-center justify-center gap-2">
            <MessageCircle size={17} /> {L.sendMessage}
          </button>
          <button onClick={() => { setBookingWorker(w); setBookingStep('form'); }} className="flex-1 bg-slate-700 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2">
            <Calendar size={17} /> {L.bookNow}
          </button>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------
  // CONTRACTOR: FAVORITES
  // ---------------------------------------------------------------------
  const renderCFavorites = () => {
    const favWorkers = WORKERS.filter(w => favorites.includes(w.id));
    return (
      <div className="p-4 space-y-3">
        <h2 className="text-lg font-black text-stone-900 tracking-tight">{L.favorites}</h2>
        {favWorkers.length === 0 ? (
          <div className="text-center text-sm text-stone-400 bg-white rounded-2xl p-8 border border-stone-200">
            <Heart size={28} className="mx-auto mb-2 text-stone-200" />
            {L.noFavoritesDesc}
          </div>
        ) : (
          <div className="space-y-3">
            {favWorkers.map(w => (
              <WorkerCard key={w.id} worker={w} lang={lang} L={L} onSelect={openWorkerDetail} isFavorite={true} onToggleFavorite={toggleFavorite} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // ---------------------------------------------------------------------
  // MAP
  // ---------------------------------------------------------------------
  const renderMap = () => {
    const allLocations = [...LOCATIONS, ...customLocations];
    let cityLocations = allLocations.filter(l => l.city === mapCity);
    if (mapChainFilter !== 'Todas') cityLocations = cityLocations.filter(l => l.chain === mapChainFilter);
    const selectedLoc = allLocations.find(l => l.id === selectedLocationId);
    const center = CITY_CENTERS[mapCity];
    const distanceToSelected = userLocation && selectedLoc ? haversineDistanceKm(userLocation.lat, userLocation.lng, selectedLoc.lat, selectedLoc.lng) * 0.621371 : null;

    const handleFindMe = () => {
      if (!('geolocation' in navigator)) { setLocationError(L.locationDeniedText); return; }
      setLocatingUser(true);
      setLocationError(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocatingUser(false); },
        () => { setLocationError(L.locationDeniedText); setLocatingUser(false); },
        { timeout: 8000 }
      );
    };

    const handleAddPoint = () => {
      if (!newPointName.trim()) return;
      const id = Date.now();
      setCustomLocations(prev => [...prev, { id, chain: 'Personalizado', name: newPointName.trim(), address: L.customChainLabel, city: mapCity, workers: 0, lat: center.lat, lng: center.lng }]);
      setNewPointName('');
      setShowAddPoint(false);
    };

    return (
      <div className="p-4 space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CITIES.map(c => <Chip key={c} label={c} activeColor="slate" active={mapCity === c} onClick={() => { setMapCity(c); setSelectedLocationId(null); }} />)}
        </div>

        <div className="flex gap-2">
          {['Todas', 'Home Depot', "Lowe's"].map(ch => (
            <Chip key={ch} label={ch === 'Todas' ? L.allChainsWord : ch} activeColor="slate" active={mapChainFilter === ch} onClick={() => setMapChainFilter(ch)} />
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={handleFindMe} className="flex-1 bg-white border border-stone-200 rounded-xl py-2 text-sm font-semibold text-stone-700 flex items-center justify-center gap-2">
            <Navigation size={15} className={locatingUser ? 'animate-pulse' : ''} /> {locatingUser ? L.locatingText : L.searchNearMe}
          </button>
          <button onClick={() => setShowAddPoint(true)} className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-500">
            <Plus size={17} />
          </button>
        </div>
        {locationError && <div className="text-xs text-rose-500">{locationError}</div>}

        {showAddPoint && (
          <div className="bg-white border border-stone-200 rounded-2xl p-3 flex items-center gap-2">
            <input value={newPointName} onChange={e => setNewPointName(e.target.value)} placeholder={L.customPointNamePlaceholder} className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 outline-none" />
            <button onClick={handleAddPoint} className="bg-rose-600 text-white rounded-xl px-3 py-2 text-sm font-semibold shrink-0">{L.addPointConfirm}</button>
          </div>
        )}

        <div className="relative rounded-2xl border border-stone-200 h-64 overflow-hidden">
          <MapContainer key={mapCity} center={[center.lat, center.lng]} zoom={center.zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {cityLocations.map(loc => (
              <Marker
                key={loc.id}
                position={[loc.lat, loc.lng]}
                icon={createPinIcon(loc.workers, selectedLocationId === loc.id, loc.chain)}
                eventHandlers={{ click: () => setSelectedLocationId(loc.id) }}
              />
            ))}
            {userLocation && <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserLocationIcon()} />}
          </MapContainer>
        </div>

        {selectedLoc ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="font-bold text-stone-900">{selectedLoc.name}</div>
              <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">{selectedLoc.chain}</span>
            </div>
            <div className="text-xs text-stone-400 mb-1">{selectedLoc.address}</div>
            <div className="text-sm text-stone-500 mb-3">
              {selectedLoc.workers} {L.workersAvailableWord}
              {distanceToSelected !== null && <span> · {distanceToSelected.toFixed(1)} {L.milesAway}</span>}
            </div>
            {role === 'contractor' ? (
              <button onClick={() => { setSelectedCity(selectedLoc.city); setScreen('c-search'); }} className="w-full bg-slate-700 text-white rounded-xl py-2.5 text-sm font-semibold">{L.viewWorkersHere}</button>
            ) : (
              <button onClick={() => { setProfile({ ...profile, meetingPoint: selectedLoc.name }); setScreen('w-home'); }} className="w-full bg-orange-600 text-white rounded-xl py-2.5 text-sm font-semibold">{L.useAsMeetingPoint}</button>
            )}
          </div>
        ) : (
          <div className="text-center text-sm text-stone-400 p-4">{L.selectPinPrompt}</div>
        )}
      </div>
    );
  };

  // ---------------------------------------------------------------------
  // MESSAGES + CHAT
  // ---------------------------------------------------------------------
  const renderMessages = () => {
    const list = role === 'worker' ? WORKER_CONVERSATIONS : CONTRACTOR_CONVERSATIONS;
    const avatarClass = role === 'worker' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700';
    return (
      <div className="p-4">
        <h2 className="text-lg font-black text-stone-900 tracking-tight mb-3">{L.messages}</h2>
        <div className="space-y-2">
          {list.map(c => (
            <button key={c.id} onClick={() => { setActiveChatId(c.id); setScreen('chat'); }} className="w-full flex items-center gap-3 bg-white border border-stone-200 rounded-2xl p-3 text-left">
              <div className={`w-11 h-11 rounded-full ${avatarClass} flex items-center justify-center font-bold shrink-0`}>{c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-900 text-sm">{c.name}</span>
                  <span className="text-xs text-stone-400">{c.time}</span>
                </div>
                <div className="text-xs text-stone-400">{c.subtitle}</div>
                <div className="text-sm text-stone-600 truncate">{c.lastMessage}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderChat = () => {
    let convName = '', convSubtitle = '';
    if (role === 'contractor') {
      const listed = CONTRACTOR_CONVERSATIONS.find(c => c.id === activeChatId);
      if (listed) { convName = listed.name; convSubtitle = listed.subtitle; }
      else {
        const w = WORKERS.find(x => x.id === activeChatId);
        if (w) { convName = w.name; convSubtitle = w.specialties.map(s => specialtyName(s, lang)).join(' · '); }
      }
    } else {
      const listed = WORKER_CONVERSATIONS.find(c => c.id === activeChatId);
      if (listed) { convName = listed.name; convSubtitle = listed.subtitle; }
    }
    const messages = chatMessages[activeChatId] || [];
    const myBubble = role === 'worker' ? 'bg-orange-600' : 'bg-slate-700';

    const sendMessage = () => {
      if (!chatInput.trim()) return;
      setChatMessages(prev => ({ ...prev, [activeChatId]: [...(prev[activeChatId] || []), { from: 'me', text: chatInput }] }));
      setChatInput('');
    };

    return (
      <div>
        <div className="flex items-center gap-3 p-4 border-b border-stone-200 sticky top-0 bg-white z-10">
          <button onClick={() => setScreen('messages')}><ArrowLeft size={20} className="text-stone-700" /></button>
          <div>
            <div className="font-semibold text-stone-900">{convName}</div>
            <div className="text-xs text-stone-500">{convSubtitle}</div>
          </div>
        </div>
        <div className="p-4 space-y-3 pb-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${m.from === 'me' ? `${myBubble} text-white` : 'bg-stone-100 text-stone-800'}`}>{m.text}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 p-3 border-t border-stone-200 sticky bottom-0 bg-white">
          <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }} placeholder={L.typeMessagePlaceholder} className="flex-1 bg-stone-100 rounded-full px-4 py-2 text-sm outline-none text-stone-900" />
          <button onClick={sendMessage} className={`${myBubble} text-white rounded-full p-2`}><Send size={18} /></button>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------
  // MENU
  // ---------------------------------------------------------------------
  const renderMenu = () => {
    const avatarClass = role === 'worker' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700';
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3 bg-white border border-stone-200 rounded-2xl p-4">
          <div className={`w-14 h-14 rounded-full ${avatarClass} flex items-center justify-center font-black text-lg overflow-hidden shrink-0`}>
            {profile.photo ? <img src={profile.photo} alt="" className="w-14 h-14 object-cover" /> : profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="font-bold text-stone-900">{profile.name}</div>
            <div className="text-xs text-stone-500">{role === 'worker' ? L.worker : L.contractor}</div>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl divide-y divide-stone-100">
          <button onClick={() => setScreen('plans')} className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3 text-sm font-medium text-stone-800"><TrendingUp size={17} /> {L.yourPlanLabel}</div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${currentTier === 'pro' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-500'}`}>
                {currentTier === 'pro' ? (role === 'worker' ? L.planWorkerPro : L.planContractorBusiness) : L.planFree}
              </span>
              <ChevronRight size={16} className="text-stone-400" />
            </div>
          </button>
          <button onClick={() => setShowHistory(!showHistory)} className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3 text-sm font-medium text-stone-800"><Clock size={17} /> {L.historyLabel}</div>
            <ChevronDown size={16} className="text-stone-400" />
          </button>
          {showHistory && (
            <div className="p-4 pt-0 space-y-2">
              {SAMPLE_HISTORY.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-stone-600">{h.desc}</span>
                  <span className="font-semibold text-stone-900">${h.amount}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 text-sm font-medium text-stone-800"><BadgeCheck size={17} className="text-slate-500" /> {L.verificationLabel}</div>
            <span className="text-xs text-emerald-600 font-semibold">{L.verifiedStatus}</span>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 text-sm font-medium text-stone-800"><Bell size={17} /> {L.notificationsLabel}</div>
            <Toggle checked={pushEnabled} onChange={() => setPushEnabled(!pushEnabled)} />
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 text-sm font-medium text-stone-800"><HelpCircle size={17} /> {L.helpSupportLabel}</div>
            <ChevronRight size={16} className="text-stone-400" />
          </div>
          <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3 text-sm font-medium text-stone-800"><Globe size={17} /> {L.languageLabel2}</div>
            <span className="text-xs text-stone-400">{lang === 'es' ? 'Español' : 'English'}</span>
          </button>
        </div>

        <button onClick={() => { const newRole = role === 'worker' ? 'contractor' : 'worker'; setRole(newRole); setScreen(newRole === 'worker' ? 'w-home' : 'c-search'); }} className="w-full bg-stone-100 text-stone-700 font-semibold rounded-2xl py-3 text-sm">
          {role === 'worker' ? L.switchToContractor : L.switchToWorker}
        </button>
        <button onClick={() => setRole(null)} className="w-full text-rose-500 font-semibold py-2 text-sm flex items-center justify-center gap-2">
          <LogOut size={16} /> {L.logout}
        </button>
      </div>
    );
  };

  // ---------------------------------------------------------------------
  // PLANS
  // ---------------------------------------------------------------------
  const renderPlans = () => {
    const isWorker = role === 'worker';
    const planName = isWorker ? L.planWorkerPro : L.planContractorBusiness;
    const price = isWorker ? '9.99' : '24.99';
    const freeFeatures = isWorker
      ? [L.planFeatureVisible, L.planFeatureRequests, L.planFeatureChatFree, L.planFeatureHistoryFree]
      : [L.planFeatureSearch, L.planFeatureBook, L.planFeatureFavLimit, L.planFeatureChatFree];
    const proFeatures = isWorker
      ? [L.planFeatureFeatured, L.planFeatureEarlyNotif, L.planFeatureStats, L.planFeatureLowerFee]
      : [L.planFeaturePriority, L.planFeatureUnlimitedFav, L.planFeatureUrgent, L.planFeatureSupport];

    return (
      <div>
        <div className="sticky top-0 bg-white z-10 flex items-center gap-3 p-4 border-b border-stone-200">
          <button onClick={() => setScreen('menu')}><ArrowLeft size={20} className="text-stone-700" /></button>
          <span className="font-bold text-stone-900">{L.plans}</span>
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="font-black text-stone-900 text-lg">{L.planFree}</span>
              {currentTier === 'free' && <span className="text-xs font-semibold bg-stone-100 text-stone-500 px-2 py-1 rounded-full">{L.currentPlanBadge}</span>}
            </div>
            <div className="text-2xl font-black text-stone-900 mb-4">$0</div>
            <ul className="space-y-2 mb-4">
              {freeFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                  <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            {currentTier !== 'free' && (
              <button onClick={() => setCurrentTier('free')} className="w-full bg-stone-100 text-stone-600 rounded-xl py-2.5 text-sm font-semibold">{L.downgradeButton}</button>
            )}
          </div>

          <div className="bg-stone-900 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="font-black text-white text-lg">{planName}</span>
              {currentTier === 'pro' && <span className="text-xs font-semibold bg-amber-400 text-stone-900 px-2 py-1 rounded-full">{L.currentPlanBadge}</span>}
            </div>
            <div className="text-2xl font-black text-white mb-4">${price}<span className="text-sm text-stone-400 font-medium">{L.perMonth}</span></div>
            <ul className="space-y-2 mb-4">
              {proFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-stone-300">
                  <Check size={16} className="text-amber-400 shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            {currentTier !== 'pro' && (
              <button onClick={() => setCurrentTier('pro')} className="w-full bg-amber-500 text-stone-900 rounded-xl py-2.5 text-sm font-bold">{L.subscribeButton}</button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------
  // BOOKING MODAL
  // ---------------------------------------------------------------------
  const renderBookingModal = () => {
    if (!bookingWorker) return null;
    return (
      <div className="absolute inset-0 bg-stone-900 bg-opacity-60 flex items-end z-40">
        <div className="bg-white w-full rounded-t-3xl p-5 max-h-full overflow-y-auto">
          {bookingStep === 'form' ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="font-black text-lg text-stone-900">{L.bookingModalTitle}</span>
                <button onClick={() => { setBookingWorker(null); setBookingStep(null); }}><X size={20} className="text-stone-500" /></button>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full ${bookingWorker.color} flex items-center justify-center text-white font-bold`}>{bookingWorker.initials}</div>
                <div>
                  <div className="font-bold text-stone-900">{bookingWorker.name}</div>
                  <div className="text-xs text-stone-500">${bookingWorker.dailyRate}{L.perDay}</div>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">{L.selectDate}</label>
                <div className="flex gap-2 mt-1">
                  {['today', 'tomorrow', 'week'].map(d => (
                    <Chip key={d} activeColor="slate" label={d === 'today' ? L.today : d === 'tomorrow' ? L.tomorrow : L.thisWeek} active={bookingDate === d} onClick={() => setBookingDate(d)} />
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">{L.jobDescriptionLabel}</label>
                <textarea value={bookingDesc} onChange={e => setBookingDesc(e.target.value)} placeholder={L.jobDescriptionPlaceholder} rows={3} className="w-full border border-stone-200 rounded-xl px-3 py-2 mt-1 text-sm outline-none text-stone-900" />
              </div>
              <div className="bg-stone-50 rounded-xl p-3 mb-4 text-sm space-y-1">
                <div className="flex justify-between"><span className="text-stone-500">{L.estimatedTotal}</span><span className="font-semibold text-stone-900">${bookingWorker.dailyRate}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">{L.serviceFee}</span><span className="font-semibold text-stone-900">$8</span></div>
              </div>
              <button onClick={() => setBookingStep('success')} className="w-full bg-slate-700 text-white font-bold py-3 rounded-2xl">{L.confirmBooking}</button>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check size={28} className="text-emerald-600" />
              </div>
              <div className="font-black text-lg text-stone-900 mb-1">{L.bookingSuccessTitle}</div>
              <div className="text-sm text-stone-500 mb-5">{L.bookingSuccessDesc}</div>
              <button onClick={() => { setBookingWorker(null); setBookingStep(null); setBookingDesc(''); setBookingDate('today'); }} className="w-full bg-slate-700 text-white font-bold py-3 rounded-2xl">{L.close}</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------
  // ROOT RENDER
  // ---------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-stone-200 flex items-center justify-center">
      <div className="w-full max-w-md h-screen bg-stone-50 flex flex-col shadow-2xl relative overflow-hidden">
        {!role ? (
          renderOnboarding()
        ) : (
          <>
            {rootScreens.includes(screen) && renderTopBar()}
            <div className="flex-1 overflow-y-auto">
              {showFavLimitNotice && (
                <div className="m-4 mb-0 bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center gap-2">
                  <Lock size={16} className="text-amber-600 shrink-0" />
                  <div className="text-xs text-amber-800 flex-1">{L.favLimitNotice}</div>
                  <button onClick={goToPlans} className="text-xs font-bold text-amber-700 underline shrink-0">{L.viewPlansButton}</button>
                  <button onClick={() => setShowFavLimitNotice(false)} className="shrink-0"><X size={16} className="text-amber-600" /></button>
                </div>
              )}
              {screen === 'w-home' && renderWHome()}
              {screen === 'w-profile' && renderWProfile()}
              {screen === 'c-search' && renderCSearch()}
              {screen === 'c-detail' && renderCDetail()}
              {screen === 'c-favorites' && renderCFavorites()}
              {screen === 'map' && renderMap()}
              {screen === 'messages' && renderMessages()}
              {screen === 'chat' && renderChat()}
              {screen === 'menu' && renderMenu()}
              {screen === 'plans' && renderPlans()}
            </div>
            {rootScreens.includes(screen) && renderBottomNav()}
          </>
        )}
        {bookingStep && renderBookingModal()}
      </div>
    </div>
  );
}
