// Centralized map of assets for clearer import

import sampleProfile from '../assets/images/photoProfile.jpg';
import bgImage from '../assets/images/bgImage.png';
import obsessionlogo from '../assets/images/obsessionlogo.png';
import modelsLogin from '../assets/images/modelsLogin.png';
import backgroundPixels from '../assets/images/backgroundPixels.png';
import backgroundCTA from '../assets/images/backgroundCTA.png';

// Brand assets served from /public — use as URL strings
const brandLogo = '/Logotipo.png';   // full horizontal logo (desktop)
const brandIcon = '/icon.png';        // square icon (mobile / favicon)

export const images = {
  bgImage,
  obsessionlogo,
  sampleProfile,
  modelsLogin,
  backgroundPixels,
  backgroundCTA,
  brandLogo,
  brandIcon,
} as const;


