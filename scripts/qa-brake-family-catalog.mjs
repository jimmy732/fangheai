import assert from 'node:assert/strict';
import fs from 'node:fs';

const catalogPath = new URL('../data/fbox-fitment.catalog.json', import.meta.url);
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const groups = Array.isArray(catalog.groups) ? catalog.groups : [];
const models = groups.flatMap(group => (group.models || []).map(model => ({ group, model })));

const normalized = value => String(value || '').toLowerCase().replace(/[|·_\s-]+/g, '');
const modelText = item => [item.model.model, item.model.part_number, ...(item.model.specs?.search_aliases || [])].join(' ');
const find = (brand, needle) => models.find(item => item.group.brand === brand && normalized(modelText(item)).includes(normalized(needle)));
const count = brand => models.filter(item => item.group.brand.toLowerCase() === brand.toLowerCase()).length;

assert.match(catalog.catalog_version, /brake-family-supplement/);
assert.equal(catalog.checked_at, '2026-08-29');

const required = [
  ['Brembo', 'GT6'],
  ['Brembo', 'F40'],
  ['Brembo', 'GT A6'],
  ['Brembo', 'GT M6'],
  ['Brembo', 'GT BM6'],
  ['Brembo', 'GT S6'],
  ['Brembo', 'GT R6'],
  ['Brembo', 'PISTA FF6'],
  ['AP Racing', 'CP9448'],
  ['AP Racing', 'CP9665'],
  ['AP Racing', 'CP9668'],
  ['ENDLESS', 'RacingMONO6 EVO'],
  ['ENDLESS', 'RacingMONO6GT NARROW for BMW'],
  ['ENDLESS', 'RacingMONO2'],
  ['Akebono', 'High-Performance OEM 6-pot'],
  ['Akebono', 'High-Performance OEM 10-pot']
];

for (const [brand, name] of required) {
  assert.ok(find(brand, name), `${brand} ${name} must be selectable/searchable`);
}

const gt6 = find('Brembo', 'GT6');
const f40 = find('Brembo', 'F40');
assert.equal(gt6.model.specs.caliper_pistons, 6);
assert.equal(gt6.group.auto_match_enabled, false);
assert.equal(gt6.group.clearance_template_required, true);
assert.match(gt6.model.notes, /not.*exact part|Do not treat/i);

const geometryKeys = [
  'rotor_diameter_mm', 'rotor_thickness_mm', 'min_disc_diameter_mm',
  'max_disc_diameter_mm', 'min_disc_thickness_mm', 'max_disc_thickness_mm',
  'min_wheel_diameter_in', 'caliper_clearance_a_mm', 'caliper_clearance_b_mm',
  'caliper_clearance_c_mm', 'mount_centres_mm', 'weight_kg'
];
for (const key of geometryKeys) {
  assert.equal(f40.model.specs[key], undefined, `F40 market alias must not guess ${key}`);
}
assert.equal(f40.group.auto_match_enabled, false);
assert.match(f40.model.notes, /complete Brembo part|exact.*number/i);

const supplementGroups = groups.filter(group => [
  'Brembo current GT and PISTA kit family guide',
  'AP Racing PRO 5000 R range',
  'ENDLESS official current brake caliper line-up',
  'Akebono high-performance original-equipment brakes'
].includes(group.source_label));
assert.equal(supplementGroups.length, 4);

const manufacturerHosts = new Set([
  'www.brembo.com', 'brembo.com',
  'apracing.com', 'www.apracing.com',
  'endless-sport.co.jp', 'www.endless-sport.co.jp',
  'www.akebono-brake.com', 'akebono-brake.com',
  'www.akebonobrakes.com', 'akebonobrakes.com'
]);

for (const group of supplementGroups) {
  assert.equal(group.parameter_scope, 'family');
  assert.equal(group.auto_match_enabled, false);
  assert.equal(group.clearance_template_required, true);
  assert.ok(group.notes, `${group.brand} supplement needs a safety note`);
  const sources = [group.source_url, ...(group.source_refs || []).map(ref => ref.url)].filter(Boolean);
  assert.ok(sources.length > 0, `${group.brand} supplement needs manufacturer evidence`);
  for (const source of sources) {
    const host = new URL(source).hostname.toLowerCase();
    assert.ok(manufacturerHosts.has(host), `non-manufacturer source rejected: ${source}`);
  }
}

const ids = supplementGroups.flatMap(group => (group.models || []).map(model => model.id));
assert.ok(ids.every(Boolean), 'every supplemental model needs a stable id');
assert.equal(new Set(ids).size, ids.length, 'supplemental ids must be unique');

const coverage = {
  Brembo: count('Brembo'),
  'AP Racing': count('AP Racing'),
  Alcon: count('Alcon'),
  StopTech: count('StopTech'),
  Wilwood: count('Wilwood'),
  ENDLESS: count('ENDLESS'),
  'Project μ': count('Project μ'),
  Akebono: count('Akebono')
};

assert.ok(coverage.Brembo >= 30);
assert.ok(coverage['AP Racing'] >= 20);
assert.ok(coverage.Alcon >= 20);
assert.ok(coverage.StopTech >= 15);
assert.ok(coverage.Wilwood >= 15);
assert.ok(coverage.ENDLESS >= 25);
assert.ok(coverage['Project μ'] >= 10);
assert.ok(coverage.Akebono >= 2);

console.log(JSON.stringify({
  ok: true,
  catalog_version: catalog.catalog_version,
  supplemental_groups: supplementGroups.length,
  supplemental_models: ids.length,
  coverage,
  safety: {
    gt6_is_family_alias: true,
    f40_geometry_is_unset: true,
    auto_match_disabled: true,
    clearance_template_required: true,
    sources_first_party_only: true
  }
}, null, 2));
