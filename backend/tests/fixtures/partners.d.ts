/**
 * @interface ILocalizedString
 * @description Represents a string that can be localized in multiple languages.
 */
interface ILocalizedString {
    en: string;
    bg: string;
}
/**
 * @enum {string} DayOfWeek
 * @description Represents the days of the week for scheduling.
 */
declare enum DayOfWeek {
    MONDAY = "MONDAY",
    TUESDAY = "TUESDAY",
    WEDNESDAY = "WEDNESDAY",
    THURSDAY = "THURSDAY",
    FRIDAY = "FRIDAY",
    SATURDAY = "SATURDAY",
    SUNDAY = "SUNDAY"
}
/**
 * @interface IWorkingHours
 * @description Defines the working hours for a specific day.
 * Times are expected in HH:mm format.
 */
interface IWorkingHours {
    day: DayOfWeek;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
}
/**
 * @enum {string} PartnerCategory
 * @description Defines the main categories for partners as per project specification.
 */
declare enum PartnerCategory {
    FOOD_DRINK = "FOOD_DRINK",
    ENTERTAINMENT_NIGHTLIFE = "ENTERTAINMENT_NIGHTLIFE",
    ACCOMMODATION = "ACCOMMODATION",
    EXPERIENCES_SERVICES = "EXPERIENCES_SERVICES"
}
/**
 * @interface IPartner
 * @description Represents the structure of a partner entity in the system.
 * This interface defines all necessary fields for a partner, including localization
 * and operational details.
 */
export interface IPartner {
    id: string;
    name: ILocalizedString;
    description: ILocalizedString;
    address: ILocalizedString;
    city: ILocalizedString;
    country: ILocalizedString;
    latitude: number;
    longitude: number;
    phone: string;
    email: string;
    website?: string;
    category: PartnerCategory;
    subcategories: ILocalizedString[];
    logoUrl: string;
    coverImageUrl: string;
    discountPercentage: number;
    discountDescription: ILocalizedString;
    isActive: boolean;
    isFeatured: boolean;
    createdAt: string;
    updatedAt: string;
    workingHours: IWorkingHours[];
    dietaryOptions?: ILocalizedString[];
    cuisineTypes?: ILocalizedString[];
}
/**
 * @constant {IPartner[]} partners
 * @description An array of mock partner data for testing purposes.
 * This data adheres to the IPartner interface and includes localized strings,
 * detailed working hours, and specific category/subcategory assignments
 * based on the project specification. This provides diverse examples
 * for various test scenarios.
 */
export declare const partners: IPartner[];
export {};
//# sourceMappingURL=partners.d.ts.map