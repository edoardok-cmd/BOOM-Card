import { Knex } from 'knex';

interface CategoryTranslation {
  language: string;
  name: string;
  description: string;
}

interface CategoryData {
  id: string;
  slug: string;
  icon: string;
  parent_id: string | null;
  display_order: number;
  is_active: boolean;
  translations: CategoryTranslation[];
}

const categories: CategoryData[] = [
  // Main Categories
  {
    id: 'cat_food_drink',
    slug: 'food-drink',
    icon: 'restaurant',
    parent_id: null,
    display_order: 1,
    is_active: true,
    translations: [
      {
        language: 'en',
        name: 'Food & Drink',
        description: 'Restaurants, cafes, bars and culinary experiences'
      },
      {
        language: 'bg',
        name: 'Храна и напитки',
        description: 'Ресторанти, кафенета, барове и кулинарни преживявания'
      }
    ]
  },
  {
    id: 'cat_entertainment',
    slug: 'entertainment',
    icon: 'nightlife',
    parent_id: null,
    display_order: 2,
    is_active: true,
    translations: [
      {
        language: 'en',
        name: 'Entertainment & Nightlife',
        description: 'Clubs, venues, events and cultural experiences'
      },
      {
        language: 'bg',
        name: 'Развлечения и нощен живот',
        description: 'Клубове, заведения, събития и културни преживявания'
      }
    ]
  },
  {
    id: 'cat_accommodation',
    slug: 'accommodation',
    icon: 'hotel',
    parent_id: null,
    display_order: 3,
    is_active: true,
    translations: [
      {
        language: 'en',
        name: 'Accommodation',
        description: 'Hotels, boutique stays and vacation rentals'
      },
      {
        language: 'bg',
        name: 'Настаняване',
        description: 'Хотели, бутикови места за престой и ваканционни наеми'
      }
    ]
  },
  {
    id: 'cat_experiences',
    slug: 'experiences',
    icon: 'activities',
    parent_id: null,
    display_order: 4,
    is_active: true,
    translations: [
      {
        language: 'en',
        name: 'Experiences & Services',
        description: 'Activities, wellness, tours and services'
      },
      {
        language: 'bg',
        name: 'Преживявания и услуги',
        description: 'Дейности, уелнес, турове и услуги'
      }
    ]
  },

  // Food & Drink Subcategories
  {
    id: 'cat_restaurants',
    slug: 'restaurants',
    icon: 'dining',
    parent_id: 'cat_food_drink',
    display_order: 1,
    is_active: true,
    translations: [
      {
        language: 'en',
        name: 'Restaurants',
        description: 'All types of restaurants and dining experiences'
      },
      {
        language: 'bg',
        name: 'Ресторанти',
        description: 'Всички видове ресторанти и заведения за хранене'
      }
    ]
  },
  {
    id: 'cat_fine_dining',
    slug: 'fine-dining',
    icon: 'fine_dining',
    parent_id: 'cat_restaurants',
    display_order: 1,
    is_active: true,
    translations: [
      {
        language: 'en',
        name: 'Fine Dining',
        description: 'Upscale restaurants with premium dining experiences'
      },
      {
        language: 'bg',
        name: 'Фино хранене',
        description: 'Луксозни ресторанти с премиум преживявания'
      }
    ]
  },
  {
    id: 'cat_casual_dining',
    slug: 'casual-dining',
    icon: 'casual_dining',
    parent_id: 'cat_restaurants',
    display_order: 2,
    is_active: true,
    translations: [
      {
        language: 'en',
        name: 'Casual Dining',
        description: 'Relaxed atmosphere restaurants for everyday dining'
      },
      {
        language: 'bg',
        name: 'Ежедневни ресторанти',
        description: 'Ресторанти с непринудена атмосфера за ежедневно хранене'
      }
    ]
  },
  {
    id: 'cat_fast_food',
    slug: 'fast-food',
    icon: 'fast_food',
    parent_id: 'cat_restaurants',
    display_order: 3,
    is_active: true,
    translations: [
      {
        language: 'en',
        name: 'Fast Food',
        description: 'Quick service restaurants and food chains'
      },
      {
        language: 'bg',
        name: 'Бързо хранене',
        description: 'Заведения за бързо обслужване и вериги за храна'
      }
    ]
  },
  {
    id: 'cat_vegan',
    slug: 'vegan',
    icon: 'vegan',
    parent_id: 'cat_restaurants',
    display_order: 4,
    is_active: true,
    translations: [
      {
        language: 'en',
        name: 'Vegan',
        description: 'Plant-based and vegan restaurants'
      },
      {
        language: 'bg',
        name: 'Веган',
        description: 'Растителни и веган ресторанти'
      }
    ]
  },
  {
    id: 'cat_vegetarian',
    slug: 'vegetarian',
    icon: 'vegetarian',
    parent_id: 'cat_restaurants',
    display_order: 5,
    is_active: true,
    translations: [
      {
        language: 'en',
        name: 'Vegetarian',
        description: 'Vegetarian-friendly restaurants'
      },
      {
        language: 'bg',
        name: 'Вегетарианско',
        description: 'Вегетариански ресторанти'
      }
    ]
  },
  {
    id: 'cat_halal',
    slug: 'halal',
    icon: 'halal',
    parent_id: 'cat_restaurants',
    display_order: 6,
    is_active: true,
    translations: [
      {
        language: 'en',
        name: 'Halal',
        description: 'Halal certified restaurants'
      },
      {
        language: 'bg',
        name: 'Халал',
        description: 'Халал сертифицирани ресторанти'
      }
    ]
  },
  {
    id: 'cat_gluten_free',
    slug: 'gluten-free',
    icon: 'gluten_free',
    parent_id: 'cat_restaurants',
    display_order: 7,
    is_active: true,
    translations: [
      {
        language: 'en',
        name: 'Gluten-Free',
        description: 'Restaurants with gluten-free options'
      },
      {
        language: 'bg',
        name: 'Без глутен',
        description: 'Ресторанти с безглутенови опции'
      }
    ]
  },
  {
    id: 'cat_bulgarian_cuisine',
    slug: 'bulgarian-cuisine',
    icon: 'bulgarian',
    parent_id: 'cat_restaurants',
    display_order: 8,
    is_active: true,
    translations: [
      {
        language: 'en',
        name: 'Bulgarian Cuisine',
        description: 'Traditional Bulgarian restaurants'
      },
      {
        language: 'bg',
        name: 'Българска кухня',
        description: 'Традиционни български ресторанти'
      }
    ]
  },
  {
    id: 'cat_italian_cuisine',
    slug: 'italian-cuisine',
    icon: 'italian',
    parent_id: 'cat_restaurants',
    display_order: 9,
    is_active: true,
    translations: [
      {
        language: 'en',
        name: 'Italian Cuisine',
        description: 'Italian restaurants and pizzerias'
      },
      {
        language: 'bg',
        name: 'Италианска кухня',
        description: 'Италиански ресторанти и пицарии'
      }
    ]
  },
  {
    id: 'cat_asian_cuisine',
    slug: 'asian-cuisine',
    icon: 'asian',
    parent_id: 'cat_restaurants',
    display_order: 10,
    is_active: true,
    translations: [
      {
        language: 'en',
        name: 'Asian Cuisine',
        description: 'Asian restaurants including Chinese, Japanese, Thai'
      },
      {
        language: 'bg',
        name: 'Азиатска кухня',
        description: 'Азиатски ресторанти включително китайски, японски, тайландски'
      }
    ]
  },
  {
    id: 'cat_cafes',
    slug: 'cafes',
    icon: 'cafe',
    parent_id: 'cat_food_drink',
    display_order: 2,
    is_active: true,
    translations: [
      {
        language: 'en',
        name: 'Cafés & Coffee Shops',
        description: 'Coffee shops, cafés and tea houses'
      },
      {
        language: 'bg',
        name: 'Кафенета',
        description: 'Кафе барове, кафенета и чайни'
      }
    ]
  },
  {
    id: 'cat_bars',
    slug: 'bars',
    icon: 'bar',
    parent_id: 'cat_food_drink',
    display_order: 3,
    is_active: true,
    translations: [
      {
        language: 'en',
        name: 'Bars & Pubs',
        description: 'All types of bars, pubs and drinking establishments'
      },
      {
        languag
}}