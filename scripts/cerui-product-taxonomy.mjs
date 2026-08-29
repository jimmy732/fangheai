const seriesNames = [
  'Axis Split-5',
  'Grand Touring Multi-Spoke',
  'Heritage Mesh 2-Piece',
  'Aero Split-5',
  'Arc Split-5',
  'Motorsport Mesh',
  'Classic 5',
  'Track 10',
  'Hexa Split-5',
  'Blade 5',
  'Vector Multi-Spoke',
  'Heritage 6',
  'Competition 5',
  'Terrain Beadlock',
  'Diamond Mesh',
  'Turbine 2-Piece',
  'Feather Multi-Spoke',
  'Turbine Aero',
  'Classic 8',
  'Racing 6',
  'Aero Tri-Spoke',
  'Flow Multi-Spoke',
  'V-5',
  'Heritage Mesh 2-Piece',
  'Track Split-5',
  'Crystal Mesh',
  'Classic 5',
  'Disc Classic',
  'Luxury Turbine',
  'Double-Y Mesh',
  'Lattice Mesh',
  'Deep-Lip Split-5 2-Piece',
  'Twin-10',
  'Executive Multi-Spoke',
  'Dynamic Split-5',
  'Heritage Disc 2-Piece'
];

const twoPieceSeries = new Set([3, 16, 24, 32, 36]);
const aeroSeries = new Set([18, 21, 28, 29]);
const luxurySeries = new Set([2, 3, 6, 11, 15, 16, 18, 21, 24, 26, 28, 29, 32, 36]);
const heritageSeries = new Set([3, 6, 7, 12, 13, 19, 20, 24, 27, 28, 36]);
const trackSeries = new Set([1, 4, 5, 8, 9, 10, 11, 13, 15, 17, 20, 22, 23, 25, 26, 30, 31, 33, 34, 35]);

const styleBySeries = {
  1: 'split-five', 2: 'multi-spoke', 3: 'mesh', 4: 'split-five', 5: 'split-five', 6: 'mesh',
  7: 'five-spoke', 8: 'ten-spoke', 9: 'split-five', 10: 'five-spoke', 11: 'multi-spoke', 12: 'six-spoke',
  13: 'five-spoke', 14: 'off-road', 15: 'mesh', 16: 'turbine', 17: 'multi-spoke', 18: 'aero-disc',
  19: 'eight-spoke', 20: 'six-spoke', 21: 'aero-disc', 22: 'multi-spoke', 23: 'split-five', 24: 'mesh',
  25: 'split-five', 26: 'mesh', 27: 'five-spoke', 28: 'aero-disc', 29: 'aero-disc', 30: 'mesh',
  31: 'mesh', 32: 'split-five', 33: 'multi-spoke', 34: 'multi-spoke', 35: 'split-five', 36: 'aero-disc'
};

const sharedTradeProfile = {
  category: 'Wheels',
  public_scope: true,
  minimum_quantity: 4,
  material: 'Forged Aluminum Alloy',
  price_mode: 'from',
  currency: 'USD',
  finish: 'Custom finish',
  load_rating_note: 'Specified against the exact vehicle and use case at quotation',
  size_note: 'Custom diameter, width, PCD, ET and center bore — final drawing required',
  customization_options: ['Custom finish', 'Center cap', 'Hardware', 'Lip profile'],
  ddp_regions: ['Europe', 'North America'],
  ddp_quote_basis: 'Destination country and postcode',
  lead_time_note: 'Target production and transport in about 30 business days; confirm with the final specification and destination'
};

function seriesProfile(index) {
  const construction = twoPieceSeries.has(index) ? 'two-piece' : index === 14 ? 'unknown' : 'monoblock';
  const designFamily = index === 14 ? 'off-road' : aeroSeries.has(index) ? 'aero-disc' : heritageSeries.has(index) ? 'heritage' : luxurySeries.has(index) ? 'luxury' : 'performance';
  const applications = [
    trackSeries.has(index) ? 'performance' : '',
    luxurySeries.has(index) ? 'luxury' : '',
    heritageSeries.has(index) ? 'heritage' : '',
    index === 14 ? 'suv-off-road' : '',
    aeroSeries.has(index) ? 'aero-floating' : ''
  ].filter(Boolean);
  if (!applications.length) applications.push('street');
  return {
    ...sharedTradeProfile,
    public_name: `CIRUI CR-${String(index).padStart(2, '0')} ${seriesNames[index - 1]} Forged Wheel`,
    construction,
    design_family: designFamily,
    spoke_style: styleBySeries[index] || 'custom',
    applications,
    classification_status: index === 14 ? 'needs-confirmation' : 'visual-inference',
    classification_note: index === 14
      ? 'Off-road / beadlock-style design visible; final construction must be confirmed from the engineering drawing.'
      : twoPieceSeries.has(index)
        ? 'Separate center, lip/barrel and exposed assembly hardware are visible in the supplied product views.'
        : 'Monoblock classification is based on the supplied product views and remains subject to the approved engineering drawing.'
  };
}

const explicitProfiles = {
  'cirui-3d-heritage-mesh-01': {
    public_name: 'CIRUI CR-H01 Motorsport Split-5 Forged Wheel',
    construction: 'monoblock', design_family: 'performance', spoke_style: 'split-five', applications: ['performance', 'street'], classification_status: 'visual-inference'
  },
  'cirui-3d-heritage-mesh-02': {
    public_name: 'CIRUI CR-H02 Motorsport Split-5 Forged Wheel',
    construction: 'monoblock', design_family: 'performance', spoke_style: 'split-five', applications: ['performance', 'street'], classification_status: 'visual-inference'
  },
  'cirui-3d-aero-disc-01': {
    public_name: 'CIRUI CR-AD01 Floating Aero Forged Wheel',
    construction: 'unknown', design_family: 'aero-disc', spoke_style: 'aero-disc', applications: ['aero-floating', 'luxury'], classification_status: 'needs-confirmation'
  },
  'cirui-3d-aero-disc-02': {
    public_name: 'CIRUI CR-AD02 Floating Disc Forged Wheel',
    construction: 'unknown', design_family: 'aero-disc', spoke_style: 'aero-disc', applications: ['aero-floating', 'luxury'], classification_status: 'needs-confirmation'
  },
  'cirui-3d-aero-disc-03': {
    public_name: 'CIRUI CR-AD03 Floating Aero Forged Wheel',
    construction: 'unknown', design_family: 'aero-disc', spoke_style: 'aero-disc', applications: ['aero-floating', 'luxury'], classification_status: 'needs-confirmation'
  },
  'cirui-3d-aero-disc-04': {
    public_name: 'CIRUI CR-AD04 Floating Disc Forged Wheel',
    construction: 'unknown', design_family: 'aero-disc', spoke_style: 'aero-disc', applications: ['aero-floating', 'luxury'], classification_status: 'needs-confirmation'
  },
  'fbox-halo-20-spoke': {
    public_name: 'CIRUI Halo 20-Spoke Deep-Lip Forged Wheel', construction: 'unknown', design_family: 'deep-lip', spoke_style: 'multi-spoke', applications: ['luxury', 'street'], classification_status: 'needs-confirmation'
  },
  'fbox-meridian-multi-spoke': {
    public_name: 'CIRUI Meridian Multi-Spoke Forged Wheel', construction: 'monoblock', design_family: 'luxury', spoke_style: 'multi-spoke', applications: ['luxury', 'street'], classification_status: 'visual-inference'
  },
  'fbox-vanta-10': {
    public_name: 'CIRUI Vanta 10-Spoke Forged Wheel', construction: 'monoblock', design_family: 'performance', spoke_style: 'ten-spoke', applications: ['performance', 'street'], classification_status: 'visual-inference'
  },
  'fbox-apex-split-spoke': {
    public_name: 'CIRUI Apex Split-Spoke Forged Wheel', construction: 'monoblock', design_family: 'performance', spoke_style: 'split-five', applications: ['performance', 'street'], classification_status: 'visual-inference'
  },
  'fbox-sv100': {
    public_name: 'CIRUI SV100 2-Piece Forged Wheel', construction: 'two-piece', design_family: 'deep-lip', spoke_style: 'multi-spoke', applications: ['luxury', 'street'], classification_status: 'confirmed'
  },
  'fbox-rse': {
    public_name: 'CIRUI RSE Performance Forged Wheel', construction: 'monoblock', design_family: 'performance', spoke_style: 'split-five', applications: ['performance', 'street'], classification_status: 'visual-inference'
  }
};

export const legacyStorefrontIds = new Set([
  'fbox-axis-19', 'fbox-velocity-18', 'fbox-forge-20', 'fbox-drift-18', 'fbox-lumen-19', 'fbox-track-17',
  'fbox-ceramic-pro', 'fbox-street-4p', 'fbox-slotted-380', 'fbox-drilled-330', 'fbox-race-pad', 'fbox-quiet-pad'
]);

export function taxonomyForProduct(id = '') {
  const key = String(id || '');
  const match = key.match(/^cirui-3d-series-(\d{2})$/);
  if (match) return seriesProfile(Number(match[1]));
  const explicit = explicitProfiles[key];
  if (!explicit) return null;
  return {
    ...sharedTradeProfile,
    ...explicit,
    classification_note: explicit.classification_status === 'confirmed'
      ? 'Construction is confirmed by the existing product specification.'
      : explicit.classification_status === 'needs-confirmation'
        ? 'Design family is visible in the supplied views; final construction must be confirmed from the engineering drawing.'
        : 'Classification is based on the supplied product views and remains subject to the approved engineering drawing.'
  };
}

