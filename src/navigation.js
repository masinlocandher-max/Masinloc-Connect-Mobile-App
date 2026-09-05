import {
  BellRing, BookOpen, Box, BriefcaseBusiness, Building2, CircleUserRound,
  Compass, HelpCircle, Home, Info, Mail, MapPin, Menu, Settings, Shield,
  ShoppingCart, Store, Truck, UserRound,
} from 'lucide-react';

export const bottomNav = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart },
  { id: 'jobs', label: 'Jobs', icon: BriefcaseBusiness },
  { id: 'report', label: 'Help Desk', icon: HelpCircle },
  { id: 'more', label: 'More', icon: Menu },
];

export const mainMenuItems = [
  { id: 'home', label: 'Home', icon: Home, tone: 'blue' },
  { id: 'bulletin', label: 'Community Bulletin', icon: BellRing, tone: 'violet' },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart, tone: 'red' },
  { id: 'orders', label: 'My Orders', icon: Box, tone: 'cyan' },
  { id: 'jobs', label: 'Jobs & Opportunities', icon: BriefcaseBusiness, tone: 'green' },
  { id: 'sellers', label: 'For Sellers', icon: Store, tone: 'gold' },
  { id: 'discover', label: 'Discover Masinloc', icon: MapPin, tone: 'purple' },
  { id: 'profile', label: 'Profile / Account', icon: UserRound, tone: 'royal' },
  { id: 'dictionary', label: 'Sambal Tina', icon: BookOpen, tone: 'orange' },
  { id: 'about', label: 'About Masinloc Connect', icon: Info, tone: 'lavender' },
  { id: 'history', label: 'Masinloc History', icon: Building2, tone: 'teal' },
  { id: 'policies', label: 'Privacy, Terms & Policies', icon: Shield, tone: 'slate' },
  { id: 'report', label: 'Help Desk', icon: HelpCircle, tone: 'crimson' },
  { id: 'contact', label: 'Contact / Feedback', icon: Mail, tone: 'pink' },
];

export const moreItems = [
  { id: 'discover', label: 'Discover Masinloc', icon: MapPin, tone: 'purple' },
  { id: 'sellers', label: 'For Sellers', icon: Store, tone: 'gold' },
  { id: 'dictionary', label: 'Sambal Tina', icon: BookOpen, tone: 'orange' },
  { id: 'bulletin', label: 'Community Bulletin', icon: BellRing, tone: 'violet' },
  { id: 'history', label: 'Masinloc History', icon: Building2, tone: 'teal' },
  { id: 'profile', label: 'Account Settings', icon: CircleUserRound, tone: 'royal' },
  { id: 'orders', label: 'My Orders', icon: ShoppingCart, tone: 'red' },
  { id: 'about', label: 'About Masinloc Connect', icon: Info, tone: 'lavender' },
  { id: 'tracking', label: 'Order Status / Tracking', icon: Truck, tone: 'cyan' },
  { id: 'policies', label: 'Privacy, Terms & Policies', icon: Settings, tone: 'slate' },
];
