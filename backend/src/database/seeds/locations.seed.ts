import { Knex } from 'knex';

interface Location {
  id: string;
  name_en: string;
  name_bg: string;
  slug: string;
  type: 'country' | 'region' | 'city' | 'district';
  parent_id: string | null;
  coordinates: {
    lat: number;
    lng: number;
  } | null;
  timezone: string;
  is_active: boolean;
  metadata: {
    population?: number;
    area_km2?: number;
    postal_codes?: string[];
    phone_code?: string;
  };
}

const locations: Location[] = [
  // Countries
  {
    id: 'loc_country_bulgaria',
    name_en: 'Bulgaria',
    name_bg: 'България',
    slug: 'bulgaria',
    type: 'country',
    parent_id: null,
    coordinates: { lat: 42.7339, lng: 25.4858 },
    timezone: 'Europe/Sofia',
    is_active: true,
    metadata: {
      population: 6916548,
      area_km2: 110879,
      phone_code: '+359'
    },

  // Regions
  {
    id: 'loc_region_sofia_grad',
    name_en: 'Sofia-Capital',
    name_bg: 'София-град',
    slug: 'sofia-capital',
    type: 'region',
    parent_id: 'loc_country_bulgaria',
    coordinates: { lat: 42.6977, lng: 23.3219 },
    timezone: 'Europe/Sofia',
    is_active: true,
    metadata: {
      population: 1328790,
      area_km2: 1349
    },
  {
    id: 'loc_region_plovdiv',
    name_en: 'Plovdiv',
    name_bg: 'Пловдив',
    slug: 'plovdiv-region',
    type: 'region',
    parent_id: 'loc_country_bulgaria',
    coordinates: { lat: 42.1354, lng: 24.7453 },
    timezone: 'Europe/Sofia',
    is_active: true,
    metadata: {
      population: 666801,
      area_km2: 5973
    },
  {
    id: 'loc_region_varna',
    name_en: 'Varna',
    name_bg: 'Варна',
    slug: 'varna-region',
    type: 'region',
    parent_id: 'loc_country_bulgaria',
    coordinates: { lat: 43.2141, lng: 27.9147 },
    timezone: 'Europe/Sofia',
    is_active: true,
    metadata: {
      population: 469885,
      area_km2: 3820
    },
  {
    id: 'loc_region_burgas',
    name_en: 'Burgas',
    name_bg: 'Бургас',
    slug: 'burgas-region',
    type: 'region',
    parent_id: 'loc_country_bulgaria',
    coordinates: { lat: 42.5048, lng: 27.4626 },
    timezone: 'Europe/Sofia',
    is_active: true,
    metadata: {
      population: 409265,
      area_km2: 7748
    },

  // Cities
  {
    id: 'loc_city_sofia',
    name_en: 'Sofia',
    name_bg: 'София',
    slug: 'sofia',
    type: 'city',
    parent_id: 'loc_region_sofia_grad',
    coordinates: { lat: 42.6977, lng: 23.3219 },
    timezone: 'Europe/Sofia',
    is_active: true,
    metadata: {
      population: 1328790,
      area_km2: 492,
      postal_codes: ['1000', '1700', '1784']
    },
  {
    id: 'loc_city_plovdiv',
    name_en: 'Plovdiv',
    name_bg: 'Пловдив',
    slug: 'plovdiv',
    type: 'city',
    parent_id: 'loc_region_plovdiv',
    coordinates: { lat: 42.1354, lng: 24.7453 },
    timezone: 'Europe/Sofia',
    is_active: true,
    metadata: {
      population: 346893,
      area_km2: 102,
      postal_codes: ['4000', '4001', '4002', '4003', '4004', '4005', '4006']
    },
  {
    id: 'loc_city_varna',
    name_en: 'Varna',
    name_bg: 'Варна',
    slug: 'varna',
    type: 'city',
    parent_id: 'loc_region_varna',
    coordinates: { lat: 43.2141, lng: 27.9147 },
    timezone: 'Europe/Sofia',
    is_active: true,
    metadata: {
      population: 335177,
      area_km2: 238,
      postal_codes: ['9000', '9001', '9002', '9003', '9004', '9005', '9006', '9007', '9008', '9009', '9010']
    },
  {
    id: 'loc_city_burgas',
    name_en: 'Burgas',
    name_bg: 'Бургас',
    slug: 'burgas',
    type: 'city',
    parent_id: 'loc_region_burgas',
    coordinates: { lat: 42.5048, lng: 27.4626 },
    timezone: 'Europe/Sofia',
    is_active: true,
    metadata: {
      population: 202766,
      area_km2: 253,
      postal_codes: ['8000', '8001', '8002', '8003', '8004', '8005', '8006', '8007', '8008', '8009', '8010']
    },
  {
    id: 'loc_city_stara_zagora',
    name_en: 'Stara Zagora',
    name_bg: 'Стара Загора',
    slug: 'stara-zagora',
    type: 'city',
    parent_id: 'loc_country_bulgaria',
    coordinates: { lat: 42.4258, lng: 25.6345 },
    timezone: 'Europe/Sofia',
    is_active: true,
    metadata: {
      population: 136781,
      area_km2: 85,
      postal_codes: ['6000', '6001', '6002', '6003', '6004', '6005', '6006']
    },
  {
    id: 'loc_city_ruse',
    name_en: 'Ruse',
    name_bg: 'Русе',
    slug: 'ruse',
    type: 'city',
    parent_id: 'loc_country_bulgaria',
    coordinates: { lat: 43.8356, lng: 25.9657 },
    timezone: 'Europe/Sofia',
    is_active: true,
    metadata: {
      population: 144936,
      area_km2: 127,
      postal_codes: ['7000', '7001', '7002', '7003', '7004', '7005']
    },

  // Sofia Districts
  {
    id: 'loc_district_sofia_center',
    name_en: 'Sofia Center',
    name_bg: 'София Център',
    slug: 'sofia-center',
    type: 'district',
    parent_id: 'loc_city_sofia',
    coordinates: { lat: 42.6977, lng: 23.3219 },
    timezone: 'Europe/Sofia',
    is_active: true,
    metadata: {
      postal_codes: ['1000', '1111', '1113']
    },
  {
    id: 'loc_district_vitosha',
    name_en: 'Vitosha',
    name_bg: 'Витоша',
    slug: 'vitosha',
    type: 'district',
    parent_id: 'loc_city_sofia',
    coordinates: { lat: 42.6494, lng: 23.2879 },
    timezone: 'Europe/Sofia',
    is_active: true,
    metadata: {
      postal_codes: ['1618', '1619']
    },
  {
    id: 'loc_district_lozenets',
    name_en: 'Lozenets',
    name_bg: 'Лозенец',
    slug: 'lozenets',
    type: 'district',
    parent_id: 'loc_city_sofia',
    coordinates: { lat: 42.6729, lng: 23.3192 },
    timezone: 'Europe/Sofia',
    is_active: true,
    metadata: {
      postal_codes: ['1164', '1407', '1421']
    },
  {
    id: 'loc_district_mladost',
    name_en: 'Mladost',
    name_bg: 'Младост',
    slug: 'mladost',
    type: 'district',
    parent_id: 'loc_city_sofia',
    coordinates: { lat: 42.6550, lng: 23.3732 },
    timezone: 'Europe/Sofia',
    is_active: true,
    metadata: {
      postal_codes: ['1712', '1715', '1750', '1784']
    },
  {
    id: 'loc_district_studentski_grad',
    name_en: 'Studentski Grad',
    name_bg: 'Студентски град',
    slug: 'studentski-grad',
    type: 'district',
    parent_id: 'loc_city_sofia',
    coordinates: { lat: 42.6507, lng: 23.3482 },
    timezone: 'Europe/Sofia',
    is_active: true,
    metadata: {
      postal_codes: ['1700']
    },

  // Varna Districts
  {
    id: 'loc_district_varna_center',
    name_en: 'Varna Center',
    name_bg: 'Варна Център',
    slug: 'varna-center',
    type: 'district',
    parent_id: 'loc_city_varna',
    coordinates: { lat: 43.2050, lng: 27.9147 },
    timezone: 'Europe/Sofia',
    is_active: true,
    metadata: {
      postal_codes: ['9000']
    },
  {
    id: 'loc_district_sea_garden',
    name_en: 'Sea Garden',
    name_bg: 'Морска градина',
    slug: 'sea-garden',
    type: 'district',
    parent_id: 'loc_city_varna',
    coordinates: { lat: 43.2014, lng: 27.9202 },
    timezone: 'Europe/Sofia',
    is_active: true,
    metadata: {
      postal_codes: ['9002']
    },

  // Resort Towns
  {
    id: 'loc_city_golden_sands',
    name_en: 'Golden Sands',
    name_bg: 'Златни пясъци',
    slug: 'golden-sands',
    type: 'city',
    parent_id: 'loc_region_varna',
    coordinates: { lat: 43.2841, lng: 28.0427 },
    timezone: 'Europe/Sofia',
    is_active: true,
    metadata: {
      postal_codes: ['9007']
    },
  {
    id: 'loc_city_sunny_beach',
    name_en: 'Sunny Beach',
    name_bg: 'Слънчев бряг',
    slug: 'sunny-beach',
    type: 'city',
    parent_id: 'loc_region_burgas',
    coordinates: { lat: 42.6897, lng: 27.7129 },
    timezone: 'Europe/Sofia',
    is_active: true,
    metadata: {
      postal_codes: ['8240']
    },
  {
    id: 'loc_city_bansko',
    name_en: 'Bansko',
    name_bg: 'Банско',
    slug: 'bansko',
    type: 'city',
    parent_id: 'loc_country_bulgaria',
    coordinates: { lat: 41.8387, lng: 23.4881 },
    timezone: 'Europe/Sofia',
    is_active: true,
    metadata: {
      population: 8838,
      postal_codes: ['2770']
    },
  {
    id: 'loc_city_borovets',
    name_en: 'Borovets',
    name_bg: 'Боровец',
    slug: 'borovets',
    type: 'city',
    parent_id: 'loc_country_bulgaria',
    coordinates: { lat: 42.2667, lng: 23.6000 },
    timezone: 'Europe/Sofia',
    is_active: true,
    metadata: {
      postal_codes: ['2010']
    }
];

export async function seed(knex: Knex): Promise<void> {
  try {
    // Disable foreign key checks for seeding
    await knex.raw('SET session_replication_role = replica;');

    // Clear existing locations
    await knex('locations').del();

    // Insert locations with proper timestamp handling
    const locationsWithTimestamps = locations.map(location => ({
      ...location,
      coordinates: location.coordinates ? knex.raw(`ST_GeomFromText('POINT(${location.coordinates.lng} ${location.coordinates.lat})', 4326)`) : null,
      metadata: JSON.stringify(location.metadata),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }));

    await knex('locations').insert(locationsWithTimestamps);

    // Re-enable foreign key checks
    await knex.raw('SET session_replication_role = DEFAULT;');

    console.log('✅ Locations seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding locations:', error);
    throw error;
  }

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.raw('SET session_replication_role = replica;');
    await knex('locations').del();
    await knex.raw('SET session_replication_role = DEFAULT;');
    console.log('✅ Locations seed rolled back successfully');
  } catch (error) {
    console.error('❌ Error rolling back locations seed:', error);
    throw error;
  }

}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
