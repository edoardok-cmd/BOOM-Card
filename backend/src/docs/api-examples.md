# BOOM Card API Examples

This document provides practical examples for interacting with the BOOM Card backend API. It covers common use cases, including user authentication, profile management, partner and discount discovery, and transaction processing.

**Base URL**: `https://api.boomcard.com/v1`

**Authentication**: Most authenticated endpoints require an `Authorization` header with a Bearer Token: `Authorization: Bearer <ACCESS_TOKEN>`.

**Internationalization (i18n)**: To request responses in a specific language, include the `Accept-Language` header. Supported languages are `en` (English, default) and `bg` (Bulgarian).
Example: `Accept-Language: bg`

---

## 1. Authentication Endpoints

### 1.1 Register User

Creates a new user account.

*   **Endpoint**: `POST /auth/register`
*   **Description**: Registers a new user with their email, password, and optional details.
*   **Request Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "SecurePassword123!",
      "fullName": "John Doe",
      "language": "en"
    }
    ```

*   **cURL Example**:
    ```bash
    curl -X POST \
      https://api.boomcard.com/v1/auth/register \
      -H 'Content-Type: application/json' \
      -d '{
        "email": "user@example.com",
        "password": "SecurePassword123!",
        "fullName": "John Doe",
        "language": "en"
      }'
    ```

*   **JavaScript (Fetch API) Example**:
    ```javascript
    /**
     * @typedef {object} RegisterPayload
     * @property {string} email
     * @property {string} password
     * @property {string} [fullName]
     * @property {'en' | 'bg'} [language]
     */

    /**
     * Registers a new user.
     * @param {RegisterPayload} userData
     * @returns {Promise<object>} The user object (excluding password hash) on success.
     */
    async function registerUser(userData) {
      try {
        const response = await fetch('https://api.boomcard.com/v1/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept-Language': userData.language || 'en' // Set language preference
          },
          body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
          // Handle API errors (e.g., 400 Bad Request, 409 Conflict)
          console.error(`Registration failed: ${response.status} - ${data.message || 'Unknown error'}`);
          throw new Error(data.message || 'Failed to register');
        }

        console.log('Registration successful:', data);
        return data; // Typically returns user public data or a success message
      } catch (error) {
        console.error('Network or unexpected error during registration:', error);
        throw error;
      }
    }

    // Example Usage:
    // registerUser({
    //   email: 'newuser@example.com',
    //   password: 'MyStrongPassword123!',
    //   fullName: 'New User',
    //   language: 'bg'
    // });
    ```

*   **Success Response (Status: 201 Created)**:
    ```json
    {
      "message": "User registered successfully",
      "user": {
        "id": "user_123abc",
        "email": "user@example.com",
        "fullName": "John Doe",
        "language": "en",
        "createdAt": "2023-10-26T10:00:00Z"
      }
    }
    ```

*   **Error Response (Example: 409 Conflict - User already exists)**:
    ```json
    {
      "statusCode": 409,
      "message": "User with this email already exists.",
      "errorCode": "USER_ALREADY_EXISTS"
    }
    ```

---

### 1.2 Login User

Authenticates a user and provides access and refresh tokens.

*   **Endpoint**: `POST /auth/login`
*   **Description**: Authenticates a user with their email and password. Returns JWTs (Access Token and Refresh Token).
*   **Request Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "SecurePassword123!"
    }
    ```

*   **cURL Example**:
    ```bash
    curl -X POST \
      https://api.boomcard.com/v1/auth/login \
      -H 'Content-Type: application/json' \
      -d '{
        "email": "user@example.com",
        "password": "SecurePassword123!"
      }'
    ```

*   **JavaScript (Fetch API) Example**:
    ```javascript
    /**
     * @typedef {object} LoginPayload
     * @property {string} email
     * @property {string} password
     */

    /**
     * @typedef {object} AuthTokens
     * @property {string} accessToken
     * @property {string} refreshToken
     * @property {number} expiresIn // Access token expiry in seconds
     */

    /**
     * Logs in a user.
     * @param {LoginPayload} credentials
     * @returns {Promise<AuthTokens>} Access and refresh tokens on success.
     */
    async function loginUser(credentials) {
      try {
        const response = await fetch('https://api.boomcard.com/v1/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (!response.ok) {
          // Handle API errors (e.g., 401 Unauthorized for invalid credentials)
          console.error(`Login failed: ${response.status} - ${data.message || 'Unknown error'}`);
          throw new Error(data.message || 'Failed to login');
        }

        console.log('Login successful:', data);
        // Store tokens securely (e.g., in HttpOnly cookies for refresh, localStorage/memory for access)
        return data; // { accessToken, refreshToken, expiresIn }
      } catch (error) {
        console.error('Network or unexpected error during login:', error);
        throw error;
      }
    }

    // Example Usage:
    // loginUser({ email: 'user@example.com', password: 'SecurePassword123!' })
    //   .then(tokens => console.log('Received tokens:', tokens))
    //   .catch(err => console.error(err.message));
    ```

*   **Success Response (Status: 200 OK)**:
    ```json
    {
      "accessToken": "eyJhbGciOiJIUzI1Ni...",
      "refreshToken": "eyJhbGciOiJIUzI1Ni...",
      "expiresIn": 3600,
      "user": {
        "id": "user_123abc",
        "email": "user@example.com",
        "fullName": "John Doe",
        "language": "en"
      }
    }
    ```

*   **Error Response (Example: 401 Unauthorized - Invalid credentials)**:
    ```json
    {
      "statusCode": 401,
      "message": "Invalid email or password.",
      "errorCode": "INVALID_CREDENTIALS"
    }
    ```

---

### 1.3 Refresh Access Token

Obtains a new access token using a refresh token.

*   **Endpoint**: `POST /auth/refresh-token`
*   **Description**: Sends a valid refresh token to get a new access token. This is crucial for maintaining user sessions without requiring re-login.
*   **Request Body**:
    ```json
    {
      "refreshToken": "eyJhbGciOiJIUzI1Ni..."
    }
    ```

*   **cURL Example**:
    ```bash
    curl -X POST \
      https://api.boomcard.com/v1/auth/refresh-token \
      -H 'Content-Type: application/json' \
      -d '{
        "refreshToken": "eyJhbGciOiJIUzI1Ni..."
      }'
    ```

*   **JavaScript (Fetch API) Example**:
    ```javascript
    /**
     * @typedef {object} RefreshTokenPayload
     * @property {string} refreshToken
     */

    /**
     * @typedef {object} NewAuthTokens
     * @property {string} accessToken
     * @property {string} refreshToken // Optionally, refresh token might also be rotated
     * @property {number} expiresIn
     */

    /**
     * Refreshes the access token using a refresh token.
     * @param {string} currentRefreshToken The refresh token obtained during login or previous refresh.
     * @returns {Promise<NewAuthTokens>} New access and refresh tokens.
     */
    async function refreshAccessToken(currentRefreshToken) {
      try {
        const response = await fetch('https://api.boomcard.com/v1/auth/refresh-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refreshToken: currentRefreshToken })
        });

        const data = await response.json();

        if (!response.ok) {
          // Handle refresh token invalidation (e.g., 401 Unauthorized)
          console.error(`Token refresh failed: ${response.status} - ${data.message || 'Unknown error'}`);
          // If refresh token is invalid, user might need to log in again
          throw new Error(data.message || 'Failed to refresh token');
        }

        console.log('Token refreshed successfully:', data);
        return data; // { accessToken, refreshToken, expiresIn }
      } catch (error) {
        console.error('Network or unexpected error during token refresh:', error);
        throw error;
      }
    }

    // Example Usage:
    // const storedRefreshToken = 'your_stored_refresh_token_here';
    // refreshAccessToken(storedRefreshToken)
    //   .then(newTokens => console.log('New access token:', newTokens.accessToken))
    //   .catch(err => console.error('Failed to refresh token, forcing re-login:', err.message));
    ```

*   **Success Response (Status: 200 OK)**:
    ```json
    {
      "accessToken": "eyJhbGciOiJIUzI1Ni.new...",
      "refreshToken": "eyJhbGciOiJIUzI1Ni.newref...",
      "expiresIn": 3600
    }
    ```

*   **Error Response (Example: 401 Unauthorized - Invalid refresh token)**:
    ```json
    {
      "statusCode": 401,
      "message": "Invalid or expired refresh token.",
      "errorCode": "INVALID_REFRESH_TOKEN"
    }
    ```

---

### 1.4 Logout User

Invalidates the current refresh token and logs out the user.

*   **Endpoint**: `POST /auth/logout`
*   **Description**: Invalidates the refresh token associated with the current session. Requires a valid `Authorization` header.
*   **Request Body**: None.

*   **cURL Example**:
    ```bash
    curl -X POST \
      https://api.boomcard.com/v1/auth/logout \
      -H 'Authorization: Bearer <ACCESS_TOKEN>'
    ```

*   **JavaScript (Fetch API) Example**:
    ```javascript
    /**
     * Logs out the current user.
     * @param {string} accessToken The current access token.
     * @returns {Promise<object>} A success message.
     */
    async function logoutUser(accessToken) {
      try {
        const response = await fetch('https://api.boomcard.com/v1/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          console.error(`Logout failed: ${response.status} - ${data.message || 'Unknown error'}`);
          throw new Error(data.message || 'Failed to logout');
        }

        console.log('Logout successful:', data.message);
        // Clear all local tokens (access and refresh)
        return data;
      } catch (error) {
        console.error('Network or unexpected error during logout:', error);
        throw error;
      }
    }

    // Example Usage:
    // const currentAccessToken = 'your_active_access_token';
    // logoutUser(currentAccessToken)
    //   .then(() => console.log('User logged out.'))
    //   .catch(err => console.error(err.message));
    ```

*   **Success Response (Status: 200 OK)**:
    ```json
    {
      "message": "Logged out successfully."
    }
    ```

*   **Error Response (Example: 401 Unauthorized - Invalid access token)**:
    ```json
    {
      "statusCode": 401,
      "message": "Unauthorized: Invalid or missing access token.",
      "errorCode": "AUTH_REQUIRED"
    }
    ```

---

## 2. User Profile & Subscription Endpoints

### 2.1 Get User Profile

Retrieves the authenticated user's profile information.

*   **Endpoint**: `GET /users/me`
*   **Description**: Fetches the details of the currently authenticated user.
*   **Required Header**: `Authorization: Bearer <ACCESS_TOKEN>`

*   **cURL Example**:
    ```bash
    curl -X GET \
      https://api.boomcard.com/v1/users/me \
      -H 'Authorization: Bearer <ACCESS_TOKEN>' \
      -H 'Accept-Language: bg'
    ```

*   **JavaScript (Fetch API) Example**:
    ```javascript
    /**
     * @typedef {object} UserProfile
     * @property {string} id
     * @property {string} email
     * @property {string} [fullName]
     * @property {'en' | 'bg'} language
     * @property {string} createdAt
     * @property {string} [lastLoginAt]
     */

    /**
     * Fetches the authenticated user's profile.
     * @param {string} accessToken The user's access token.
     * @param {'en' | 'bg'} [lang='en'] The preferred language for content.
     * @returns {Promise<UserProfile>} The user profile data.
     */
    async function getUserProfile(accessToken, lang = 'en') {
      try {
        const response = await fetch('https://api.boomcard.com/v1/users/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept-Language': lang
          }
        });

        const data = await response.json();

        if (!response.ok) {
          console.error(`Failed to fetch profile: ${response.status} - ${data.message || 'Unknown error'}`);
          throw new Error(data.message || 'Failed to fetch user profile');
        }

        console.log('User profile:', data);
        return data;
      } catch (error) {
        console.error('Network or unexpected error fetching profile:', error);
        throw error;
      }
    }

    // Example Usage:
    // const token = 'your_access_token';
    // getUserProfile(token, 'bg')
    //   .then(profile => console.log('Bulgarian profile data:', profile))
    //   .catch(err => console.error(err.message));
    ```

*   **Success Response (Status: 200 OK)**:
    ```json
    {
      "id": "user_123abc",
      "email": "user@example.com",
      "fullName": "Иван Петров",
      "language": "bg",
      "createdAt": "2023-10-26T10:00:00Z",
      "lastLoginAt": "2023-11-01T15:30:00Z"
    }
    ```

*   **Error Response (Example: 401 Unauthorized)**:
    ```json
    {
      "statusCode": 401,
      "message": "Unauthorized: Invalid or missing access token.",
      "errorCode": "AUTH_REQUIRED"
    }
    ```

---

### 2.2 Update User Profile

Updates specific fields of the authenticated user's profile.

*   **Endpoint**: `PATCH /users/me`
*   **Description**: Allows users to update their name, preferred language, etc.
*   **Required Header**: `Authorization: Bearer <ACCESS_TOKEN>`
*   **Request Body**:
    ```json
    {
      "fullName": "Jane Doe",
      "language": "en"
    }
    ```

*   **cURL Example**:
    ```bash
    curl -X PATCH \
      https://api.boomcard.com/v1/users/me \
      -H 'Authorization: Bearer <ACCESS_TOKEN>' \
      -H 'Content-Type: application/json' \
      -d '{
        "fullName": "Jane Doe",
        "language": "en"
      }'
    ```

*   **JavaScript (Fetch API) Example**:
    ```javascript
    /**
     * @typedef {object} UpdateProfilePayload
     * @property {string} [fullName]
     * @property {'en' | 'bg'} [language]
     * @property {string} [newPassword]
     */

    /**
     * Updates the authenticated user's profile.
     * @param {string} accessToken The user's access token.
     * @param {UpdateProfilePayload} updates The fields to update.
     * @returns {Promise<UserProfile>} The updated user profile data.
     */
    async function updateUserProfile(accessToken, updates) {
      try {
        const response = await fetch('https://api.boomcard.com/v1/users/me', {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept-Language': updates.language || 'en' // Apply new language if set
          },
          body: JSON.stringify(updates)
        });

        const data = await response.json();

        if (!response.ok) {
          console.error(`Failed to update profile: ${response.status} - ${data.message || 'Unknown error'}`);
          throw new Error(data.message || 'Failed to update user profile');
        }

        console.log('Profile updated:', data);
        return data;
      } catch (error) {
        console.error('Network or unexpected error updating profile:', error);
        throw error;
      }
    }

    // Example Usage:
    // const token = 'your_access_token';
    // updateUserProfile(token, { fullName: 'Jane Smith', language: 'en' })
    //   .then(profile => console.log('Updated profile:', profile))
    //   .catch(err => console.error(err.message));
    ```

*   **Success Response (Status: 200 OK)**:
    ```json
    {
      "id": "user_123abc",
      "email": "user@example.com",
      "fullName": "Jane Doe",
      "language": "en",
      "createdAt": "2023-10-26T10:00:00Z",
      "lastLoginAt": "2023-11-01T15:30:00Z"
    }
    ```

*   **Error Response (Example: 400 Bad Request - Invalid data)**:
    ```json
    {
      "statusCode": 400,
      "message": "Validation failed: 'fullName' must be a string.",
      "details": [
        { "field": "fullName", "message": "'fullName' must be a string" }
      ],
      "errorCode": "VALIDATION_ERROR"
    }
    ```

---

### 2.3 Get User Subscriptions

Retrieves the authenticated user's active and past subscriptions.

*   **Endpoint**: `GET /subscriptions/me`
*   **Description**: Lists all subscription records for the current user, including status, start/end dates, and plan details.
*   **Required Header**: `Authorization: Bearer <ACCESS_TOKEN>`

*   **cURL Example**:
    ```bash
    curl -X GET \
      https://api.boomcard.com/v1/subscriptions/me \
      -H 'Authorization: Bearer <ACCESS_TOKEN>'
    ```

*   **JavaScript (Fetch API) Example**:
    ```javascript
    /**
     * @typedef {object} SubscriptionPlan
     * @property {string} id
     * @property {string} name_en
     * @property {string} name_bg
     * @property {string} description_en
     * @property {string} description_bg
     * @property {number} price
     * @property {string} currency
     * @property {string} durationUnit // e.g., 'month', 'year'
     * @property {number} durationValue
     */

    /**
     * @typedef {object} UserSubscription
     * @property {string} id
     * @property {string} userId
     * @property {SubscriptionPlan} plan
     * @property {string} status // e.g., 'active', 'inactive', 'canceled', 'pending'
     * @property {string} startDate
     * @property {string} endDate
     * @property {string} createdAt
     * @property {string} [canceledAt]
     * @property {boolean} autoRenew
     */

    /**
     * Fetches the authenticated user's subscriptions.
     * @param {string} accessToken The user's access token.
     * @returns {Promise<UserSubscription[]>} An array of subscription objects.
     */
    async function getUserSubscriptions(accessToken) {
      try {
        const response = await fetch('https://api.boomcard.com/v1/subscriptions/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          console.error(`Failed to fetch subscriptions: ${response.status} - ${data.message || 'Unknown error'}`);
          throw new Error(data.message || 'Failed to fetch user subscriptions');
        }

        console.log('User subscriptions:', data);
        return data;
      } catch (error) {
        console.error('Network or unexpected error fetching subscriptions:', error);
        throw error;
      }
    }

    // Example Usage:
    // const token = 'your_access_token';
    // getUserSubscriptions(token)
    //   .then(subscriptions => console.log('User subscriptions:', subscriptions))
    //   .catch(err => console.error(err.message));
    ```

*   **Success Response (Status: 200 OK)**:
    ```json
    [
      {
        "id": "sub_456def",
        "userId": "user_123abc",
        "plan": {
          "id": "plan_boom_annual",
          "name_en": "BOOM Annual Pass",
          "name_bg": "BOOM Годишен Абонамент",
          "description_en": "Unlimited discounts for one year.",
          "description_bg": "Неограничени отстъпки за една година.",
          "price": 49.99,
          "currency": "BGN",
          "durationUnit": "year",
          "durationValue": 1
        },
        "status": "active",
        "startDate": "2023-01-01T00:00:00Z",
        "endDate": "2024-01-01T00:00:00Z",
        "createdAt": "2023-01-01T00:00:00Z",
        "autoRenew": true
      },
      {
        "id": "sub_789ghi",
        "userId": "user_123abc",
        "plan": {
          "id": "plan_boom_monthly",
          "name_en": "BOOM Monthly Pass",
          "name_bg": "BOOM Месечен Абонамент",
          "description_en": "Unlimited discounts for one month.",
          "description_bg": "Неограничени отстъпки за един месец.",
          "price": 5.99,
          "currency": "BGN",
          "durationUnit": "month",
          "durationValue": 1
        },
        "status": "inactive",
        "startDate": "2022-12-01T00:00:00Z",
        "endDate": "2023-01-01T00:00:00Z",
        "createdAt": "2022-12-01T00:00:00Z",
        "canceledAt": "2022-12-30T10:00:00Z",
        "autoRenew": false
      }
    ]
    ```

*   **Error Response (Example: 404 Not Found - User has no subscriptions)**:
    ```json
    {
      "statusCode": 404,
      "message": "No subscriptions found for this user.",
      "errorCode": "NO_SUBSCRIPTIONS"
    }
    ```

---

### 2.4 Cancel User Subscription

Initiates the cancellation process for the user's current active subscription.

*   **Endpoint**: `POST /subscriptions/me/cancel`
*   **Description**: Marks the user's active subscription for cancellation. Depending on the plan, it might cancel immediately or at the end of the current billing period.
*   **Required Header**: `Authorization: Bearer <ACCESS_TOKEN>`
*   **Request Body**: None (or optional `reason` field).

*   **cURL Example**:
    ```bash
    curl -X POST \
      https://api.boomcard.com/v1/subscriptions/me/cancel \
      -H 'Authorization: Bearer <ACCESS_TOKEN>' \
      -H 'Content-Type: application/json' \
      -d '{ "reason": "No longer needed" }'
    ```

*   **JavaScript (Fetch API) Example**:
    ```javascript
    /**
     * Cancels the authenticated user's current active subscription.
     * @param {string} accessToken The user's access token.
     * @param {string} [reason] Optional reason for cancellation.
     * @returns {Promise<object>} A success message.
     */
    async function cancelUserSubscription(accessToken, reason) {
      try {
        const response = await fetch('https://api.boomcard.com/v1/subscriptions/me/cancel', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reason })
        });

        const data = await response.json();

        if (!response.ok) {
          console.error(`Failed to cancel subscription: ${response.status} - ${data.message || 'Unknown error'}`);
          throw new Error(data.message || 'Failed to cancel subscription');
        }

        console.log('Subscription cancellation initiated:', data.message);
        return data;
      } catch (error) {
        console.error('Network or unexpected error canceling subscription:', error);
        throw error;
      }
    }

    // Example Usage:
    // const token = 'your_access_token';
    // cancelUserSubscription(token, 'Moving to a new city.')
    //   .then(() => console.log('Subscription cancellation requested.'))
    //   .catch(err => console.error(err.message));
    ```

*   **Success Response (Status: 200 OK)**:
    ```json
    {
      "message": "Subscription cancellation initiated. It will remain active until 2024-01-01.",
      "subscriptionId": "sub_456def",
      "status": "pending_cancellation"
    }
    ```

*   **Error Response (Example: 400 Bad Request - No active subscription)**:
    ```json
    {
      "statusCode": 400,
      "message": "No active subscription found to cancel.",
      "errorCode": "NO_ACTIVE_SUBSCRIPTION"
    }
    ```

---

## 3. Partner & Discount Discovery Endpoints

### 3.1 Search Partners

Searches for partners based on various criteria.

*   **Endpoint**: `GET /partners`
*   **Description**: Retrieves a list of partners filtered by search query, category, location, and discount range. Supports pagination.
*   **Query Parameters**:
    *   `q` (string, optional): Search term (e.g., restaurant name, cuisine).
    *   `category` (string, optional): Category slug or ID (e.g., `fine-dining`, `hotels`).
    *   `location` (string, optional): City or specific location name (e.g., `Sofia`).
    *   `latitude` (number, optional): Latitude for proximity search.
    *   `longitude` (number, optional): Longitude for proximity search.
    *   `radiusKm` (number, optional): Radius in kilometers for proximity search (default 10km).
    *   `discountMin` (number, optional): Minimum discount percentage.
    *   `discountMax` (number, optional): Maximum discount percentage.
    *   `page` (number, optional, default 1): Page number for pagination.
    *   `limit` (number, optional, default 10): Number of results per page.
*   **Required Header**: `Accept-Language` (for partner names/descriptions).

*   **cURL Example**:
    ```bash
    curl -X GET \
      "https://api.boomcard.com/v1/partners?q=pizza&category=fast-food&location=Sofia&discountMin=10&page=1&limit=5" \
      -H 'Accept-Language: en'
    ```

*   **JavaScript (Fetch API) Example**:
    ```javascript
    /**
     * @typedef {object} PartnerSearchFilters
     * @property {string} [q] Search query.
     * @property {string} [category] Category slug or ID.
     * @property {string} [location] City name.
     * @property {number} [latitude] Latitude for proximity search.
     * @property {number} [longitude] Longitude for proximity search.
     * @property {number} [radiusKm] Radius in kilometers.
     * @property {number} [discountMin] Minimum discount percentage.
     * @property {number} [discountMax] Maximum discount percentage.
     * @property {number} [page] Page number (default 1).
     * @property {number} [limit] Results per page (default 10).
     */

    /**
     * @typedef {object} PartnerDiscount
     * @property {string} id
     * @property {string} name_en
     * @property {string} name_bg
     * @property {string} description_en
     * @property {string} description_bg
     * @property {number} percentage
     * @property {string} type // e.g., 'percentage', 'fixed_amount'
     * @property {string} [conditions_en]
     * @property {string} [conditions_bg]
     */

    /**
     * @typedef {object} PartnerLocation
     * @property {string} address
     * @property {string} city
     * @property {string} country
     * @property {number} latitude
     * @property {number} longitude
     */

    /**
     * @typedef {object} Partner
     * @property {string} id
     * @property {string} name // Localized name
     * @property {string} description // Localized description
     * @property {string} logoUrl
     * @property {string} coverImageUrl
     * @property {string[]} categories
     * @property {PartnerLocation[]} locations
     * @property {PartnerDiscount[]} discounts
     * @property {number} averageRating
     * @property {number} reviewCount
     */

    /**
     * Searches for partners based on filters.
     * @param {PartnerSearchFilters} filters
     * @param {'en' | 'bg'} [lang='en'] The preferred language for partner details.
     * @returns {Promise<{partners: Partner[], total: number, page: number, limit: number}>} Search results.
     */
    async function searchPartners(filters, lang = 'en') {
      try {
        const queryParams = new URLSearchParams();
        for (const key in filters) {
          if (filters[key] !== undefined) {
            queryParams.append(key, filters[key].toString());
          }
        }
        const url = `https://api.boomcard.com/v1/partners?${queryParams.toString()}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept-Language': lang
          }
        });

        const data = await response.json();

        if (!response.ok) {
          console.error(`Failed to search partners: ${response.status} - ${data.message || 'Unknown error'}`);
          throw new Error(data.message || 'Failed to search partners');
        }

        console.log('Partners found:', data);
        return data; // { partners: [...], total, page, limit }
      } catch (error) {
        console.error('Network or unexpected error searching partners:', error);
        throw error;
      }
    }

    // Example Usage:
    // searchPartners({ q: 'sushi', category: 'restaurants', location: 'Sofia', discountMin: 15, limit: 3 }, 'bg')
    //   .then(results => console.log('Bulgarian sushi places:', results.partners))
    //   .catch(err => console.error(err.message));

    // Example with proximity search (requires user location)
    // searchPartners({ latitude: 42.6977, longitude: 23.3219, radiusKm: 5, category: 'cafes' })
    //   .then(results => console.log('Cafes near Sofia city center:', results.partners));
    ```

*   **Success Response (Status: 200 OK)**:
    ```json
    {
      "partners": [
        {
          "id": "partner_pizza_hut_sofia",
          "name": "Pizza Hut (бул. Витоша)",
          "description": "Класически пици и италиански ястия.",
          "logoUrl": "https://cdn.boomcard.com/logos/pizza_hut.png",
          "coverImageUrl": "https://cdn.boomcard.com/covers/pizza_hut_vitosha.jpg",
          "categories": ["fast-food", "restaurants"],
          "locations": [
            {
              "address": "бул. Витоша 23",
              "city": "София",
              "country": "България",
              "latitude": 42.6953,
              "longitude": 23.3204
            }
          ],
          "discounts": [
            {
              "id": "discount_pizza_hut_15",
              "name_en": "15% off all pizzas",
              "name_bg": "15% отстъпка на всички пици",
              "description_en": "Valid for dine-in and takeout.",
              "description_bg": "Важи за консумация на място и за вкъщи.",
              "percentage": 15,
              "type": "percentage"
            }
          ],
          "averageRating": 4.2,
          "reviewCount": 150
        }
      ],
      "total": 1,
      "page": 1,
      "limit": 5
    }
    ```

*   **Error Response (Example: 400 Bad Request - Invalid query parameter)**:
    ```json
    {
      "statusCode": 400,
      "message": "Validation failed: 'discountMin' must be a number.",
      "details": [
        { "field": "discountMin", "message": "'discountMin' must be a number" }
      ],
      "errorCode": "VALIDATION_ERROR"
    }
    ```

---

### 3.2 Get Partner Details

Retrieves detailed information about a specific partner.

*   **Endpoint**: `GET /partners/:partnerId`
*   **Description**: Fetches all available details for a single partner, including all their locations, discounts, reviews, etc.
*   **Path Parameters**:
    *   `partnerId` (string, required): The unique ID of the partner.
*   **Required Header**: `Accept-Language`

*   **cURL Example**:
    ```bash
    curl -X GET \
      https://api.boomcard.com/v1/partners/partner_pizza_hut_sofia \
      -H 'Accept-Language: en'
    ```

*   **JavaScript (Fetch API) Example**:
    ```javascript
    /**
     * Fetches details for a specific partner.
     * @param {string} partnerId The ID of the partner.
     * @param {'en' | 'bg'} [lang='en'] The preferred language.
     * @returns {Promise<Partner>} The detailed partner object.
     */
    async function getPartnerDetails(partnerId, lang = 'en') {
      try {
        const response = await fetch(`https://api.boomcard.com/v1/partners/${partnerId}`, {
          method: 'GET',
          headers: {
            'Accept-Language': lang
          }
        });

        const data = await response.json();

        if (!response.ok) {
          console.error(`Failed to fetch partner details: ${response.status} - ${data.message || 'Unknown error'}`);
          throw new Error(data.message || 'Failed to fetch partner details');
        }

        console.log('Partner details:', data);
        return data;
      } catch (error) {
        console.error('Network or unexpected error fetching partner details:', error);
        throw error;
      }
    }

    // Example Usage:
    // getPartnerDetails('partner_pizza_hut_sofia', 'en')
    //   .then(partner => console.log('Details for Pizza Hut:', partner))
    //   .catch(err => console.error(err.message));
    ```

*   **Success Response (Status: 200 OK)**:
    ```json
    {
      "id": "partner_pizza_hut_sofia",
      "name": "Pizza Hut (Vitosha Blvd.)",
      "description": "Classic pizzas and Italian dishes.",
      "logoUrl": "https://cdn.boomcard.com/logos/pizza_hut.png",
      "coverImageUrl": "https://cdn.boomcard.com/covers/pizza_hut_vitosha.jpg",
      "categories": ["fast-food", "restaurants"],
      "locations": [
        {
          "address": "Vitosha Blvd. 23",
          "city": "Sofia",
          "country": "Bulgaria",
          "latitude": 42.6953,
          "longitude": 23.3204,
          "phone": "+359881234567"
        },
        {
          "address": "Mall of Sofia, Blvd. Alexander Stamboliyski 101",
          "city": "Sofia",
          "country": "Bulgaria",
          "latitude": 42.6974,
          "longitude": 23.3039,
          "phone": "+359887654321"
        }
      ],
      "discounts": [
        {
          "id": "discount_pizza_hut_15",
          "name_en": "15% off all pizzas",
          "name_bg": "15% отстъпка на всички пици",
          "description_en": "Valid for dine-in and takeout.",
          "description_bg": "Важи за консумация на място и за вкъщи.",
          "percentage": 15,
          "type": "percentage",
          "conditions_en": "Excludes promotional items.",
          "conditions_bg": "Не включва промоционални продукти."
        },
        {
          "id": "discount_pizza_hut_drink",
          "name_en": "Free soft drink with any pizza",
          "name_bg": "Безплатна безалкохолна напитка с всяка пица",
          "description_en": "Limit one per person.",
          "description_bg": "Ограничение едно на човек.",
          "type": "fixed_item"
        }
      ],
      "averageRating": 4.2,
      "reviewCount": 150,
      "websiteUrl": "https://pizzahut.bg",
      "openingHours": {
        "Monday": "10:00-22:00",
        "Tuesday": "10:00-22:00",
        "Wednesday": "10:00-22:00",
        "Thursday": "10:00-22:00",
        "Friday": "10:00-23:00",
        "Saturday": "10:00-23:00",
        "Sunday": "10:00-22:00"
      }
    }
    ```

*   **Error Response (Example: 404 Not Found - Partner not found)**:
    ```json
    {
      "statusCode": 404,
      "message": "Partner with ID 'non_existent_partner' not found.",
      "errorCode": "PARTNER_NOT_FOUND"
    }
    ```

---

### 3.3 Get Trending Deals

Retrieves a list of currently popular or high-value deals.

*   **Endpoint**: `GET /deals/trending`
*   **Description**: Provides a curated list of deals that are currently trending or highly beneficial to users.
*   **Query Parameters**:
    *   `limit` (number, optional, default 5): The maximum number of deals to return.
    *   `location` (string, optional): Filter by city.
    *   `latitude` (number, optional): Latitude for proximity.
    *   `longitude` (number, optional): Longitude for proximity.
    *   `radiusKm` (number, optional): Radius in kilometers for proximity.
*   **Required Header**: `Accept-Language`

*   **cURL Example**:
    ```bash
    curl -X GET \
      "https://api.boomcard.com/v1/deals/trending?limit=3&location=Plovdiv" \
      -H 'Accept-Language: bg'
    ```

*   **JavaScript (Fetch API) Example**:
    ```javascript
    /**
     * @typedef {object} TrendingDeal
     * @property {string} id
     * @property {string} title // Localized title of the deal
     * @property {string} description // Localized description
     * @property {number} percentage // Example: 20
     * @property {string} imageUrl
     * @property {object} partner // Nested partner object (simplified)
     * @property {string} partner.id
     * @property {string} partner.name // Localized partner name
     * @property {string} partner.logoUrl
     * @property {string} partner.city // Main city of partner, or nearest location city
     */

    /**
     * Fetches trending deals.
     * @param {object} [options]
     * @param {number} [options.limit=5] Max number of deals.
     * @param {string} [options.location] Filter by city.
     * @param {number} [options.latitude] Latitude for proximity search.
     * @param {number} [options.longitude] Longitude for proximity search.
     * @param {number} [options.radiusKm] Radius in kilometers.
     * @param {'en' | 'bg'} [lang='en'] The preferred language.
     * @returns {Promise<TrendingDeal[]>} An array of trending deals.
     */
    async function getTrendingDeals(options = {}, lang = 'en') {
      try {
        const queryParams = new URLSearchParams();
        if (options.limit) queryParams.append('limit', options.limit.toString());
        if (options.location) queryParams.append('location', options.location);
        if (options.latitude) queryParams.append('latitude', options.latitude.toString());
        if (options.longitude) queryParams.append('longitude', options.longitude.toString());
        if (options.radiusKm) queryParams.append('radiusKm', options.radiusKm.toString());

        const url = `https://api.boomcard.com/v1/deals/trending?${queryParams.toString()}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept-Language': lang
          }
        });

        const data = await response.json();

        if (!response.ok) {
          console.error(`Failed to fetch trending deals: ${response.status} - ${data.message || 'Unknown error'}`);
          throw new Error(data.message || 'Failed to fetch trending deals');
        }

        console.log('Trending deals:', data);
        return data;
      } catch (error) {
        console.error('Network or unexpected error fetching trending deals:', error);
        throw error;
      }
    }

    // Example Usage:
    // getTrendingDeals({ limit: 2, location: 'Varna' }, 'en')
    //   .then(deals => console.log('Trending deals in Varna:', deals))
    //   .catch(err => console.error(err.message));
    ```

*   **Success Response (Status: 200 OK)**:
    ```json
    [
      {
        "id": "deal_spa_weekend",
        "title": "20% off Spa Weekend Package",
        "description": "Relax and unwind at our luxury spa with a special Boom Card discount.",
        "percentage": 20,
        "imageUrl": "https://cdn.boomcard.com/deals/spa_weekend.jpg",
        "partner": {
          "id": "partner_grand_hotel_plovdiv",
          "name": "Grand Hotel Plovdiv",
          "logoUrl": "https://cdn.boomcard.com/logos/grand_hotel_plovdiv.png",
          "city": "Plovdiv"
        }
      },
      {
        "id": "deal_burger_combo",
        "title": "Free fries with any burger",
        "description": "Enjoy a complimentary side of fries with your delicious burger.",
        "imageUrl": "https://cdn.boomcard.com/deals/burger_combo.jpg",
        "partner": {
          "id": "partner_burger_palace",
          "name": "Burger Palace",
          "logoUrl": "https://cdn.boomcard.com/logos/burger_palace.png",
          "city": "Plovdiv"
        },
        "percentage": null,
        "type": "fixed_item"
      }
    ]
    ```

*   **Error Response (Example: 500 Internal Server Error)**:
    ```json
    {
      "statusCode": 500,
      "message": "An unexpected error occurred while fetching trending deals.",
      "errorCode": "SERVER_ERROR"
    }
    ```

---

### 3.4 Get All Categories

Retrieves a list of all available partner categories.

*   **Endpoint**: `GET /categories`
*   **Description**: Returns a hierarchical or flat list of categories used to classify partners (e.g., "Restaurants", "Hotels", "Spas").
*   **Required Header**: `Accept-Language`

*   **cURL Example**:
    ```bash
    curl -X GET \
      https://api.boomcard.com/v1/categories \
      -H 'Accept-Language: bg'
    ```

*   **JavaScript (Fetch API) Example**:
    ```javascript
    /**
     * @typedef {object} Category
     * @property {string} id
     * @property {string} slug
     * @property {string} name // Localized name
     * @property {string} description // Localized description
     * @property {string} iconUrl
     * @property {Category[]} [subcategories]
     */

    /**
     * Fetches all available partner categories.
     * @param {'en' | 'bg'} [lang='en'] The preferred language for category names/descriptions.
     * @returns {Promise<Category[]>} An array of category objects.
     */
    async function getAllCategories(lang = 'en') {
      try {
        const response = await fetch('https://api.boomcard.com/v1/categories', {
          method: 'GET',
          headers: {
            'Accept-Language': lang
          }
        });

        const data = await response.json();

        if (!response.ok) {
          console.error(`Failed to fetch categories: ${response.status} - ${data.message || 'Unknown error'}`);
          throw new Error(data.message || 'Failed to fetch categories');
        }

        console.log('All categories:', data);
        return data;
      } catch (error) {
        console.error('Network or unexpected error fetching categories:', error);
        throw error;
      }
    }

    // Example Usage:
    // getAllCategories('bg')
    //   .then(categories => console.log('Bulgarian categories:', categories))
    //   .catch(err => console.error(err.message));
    ```

*   **Success Response (Status: 200 OK)**:
    ```json
    [
      {
        "id": "cat_food_drink",
        "slug": "food-drink",
        "name": "Храна и напитки",
        "description": "Ресторанти, кафенета, барове.",
        "iconUrl": "https://cdn.boomcard.com/icons/food.png",
        "subcategories": [
          {
            "id": "cat_restaurants",
            "slug": "restaurants",
            "name": "Ресторанти",
            "description": "Всички видове заведения за хранене.",
            "iconUrl": "https://cdn.boomcard.com/icons/restaurant.png"
          },
          {
            "id": "cat_cafes",
            "slug": "cafes",
            "name": "Кафенета и сладкарници",
            "description": "Места за кафе и десерти.",
            "iconUrl": "https://cdn.boomcard.com/icons/cafe.png"
          }
        ]
      },
      {
        "id": "cat_accommodation",
        "slug": "accommodation",
        "name": "Настаняване",
        "description": "Хотели, къщи за гости.",
        "iconUrl": "https://cdn.boomcard.com/icons/hotel.png"
      }
    ]
    ```

*   **Error Response (Example: 500 Internal Server Error)**:
    ```json
    {
      "statusCode": 500,
      "message": "An unexpected error occurred while fetching categories.",
      "errorCode": "SERVER_ERROR"
    }
    ```

---

## 4. Transaction & POS Integration Endpoints

These endpoints are primarily for use by POS systems at partner venues or by administrators to validate and log transactions. They require higher privileges.

### 4.1 Validate Discount (for POS/Admin)

Validates a user's subscription and eligibility for a specific partner's discount using a QR code.

*   **Endpoint**: `POST /transactions/validate`
*   **Description**: A POS system (or Admin) scans a user's BOOM Card QR code and sends it along with the partner's ID to check if the user has an active subscription and is eligible for discounts at this partner.
*   **Required Header**: `Authorization: Bearer <POS_OR_ADMIN_ACCESS_TOKEN>`
*   **Request Body**:
    ```json
    {
      "userQrCode": "user_qr_code_from_mobile_app",
      "partnerId": "partner_pizza_hut_sofia",
      "discountId": "discount_pizza_hut_15"
    }
    ```

*   **cURL Example**:
    ```bash
    curl -X POST \
      https://api.boomcard.com/v1/transactions/validate \
      -H 'Authorization: Bearer <POS_OR_ADMIN_ACCESS_TOKEN>' \
      -H 'Content-Type: application/json' \
      -d '{
        "userQrCode": "QRCODE123ABCDEF",
        "partnerId": "partner_pizza_hut_sofia",
        "discountId": "discount_pizza_hut_15"
      }'
    ```

*   **JavaScript (Fetch API) Example**:
    ```javascript
    /**
     * @typedef {object} ValidateDiscountPayload
     * @property {string} userQrCode The QR code scanned from the user's app.
     * @property {string} partnerId The ID of the partner validating the discount.
     * @property {string} [discountId] Optional: The specific discount ID being applied.
     */

    /**
     * @typedef {object} ValidationResult
     * @property {boolean} isValid Whether the user is eligible for the discount.
     * @property {string} message A descriptive message (localized).
     * @property {object} [userDetails] Basic user info if valid.
     * @property {string} userDetails.id
     * @property {string} userDetails.fullName
     * @property {object} [applicableDiscount] Details of the discount applicable.
     * @property {string} applicableDiscount.id
     * @property {string} applicableDiscount.name
     * @property {number} [applicableDiscount.percentage]
     * @property {string} [applicableDiscount.type]
     * @property {string} [applicableDiscount.conditions]
     */

    /**
     * Validates a user's discount eligibility.
     * This is typically called by a POS system.
     * @param {string} posOrAdminAccessToken The access token of the POS system or an admin.
     * @param {ValidateDiscountPayload} validationData
     * @param {'en' | 'bg'} [lang='en'] Preferred language for messages.
     * @returns {Promise<ValidationResult>} Validation result.
     */
    async function validateDiscount(posOrAdminAccessToken, validationData, lang = 'en') {
      try {
        const response = await fetch('https://api.boomcard.com/v1/transactions/validate', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${posOrAdminAccessToken}`,
            'Content-Type': 'application/json',
            'Accept-Language': lang
          },
          body: JSON.stringify(validationData)
        });

        const data = await response.json();

        if (!response.ok) {
          console.error(`Discount validation failed: ${response.status} - ${data.message || 'Unknown error'}`);
          throw new Error(data.message || 'Failed to validate discount');
        }

        console.log('Discount validation result:', data);
        return data;
      } catch (error) {
        console.error('Network or unexpected error validating discount:', error);
        throw error;
      }
    }

    // Example Usage:
    // const posToken = 'your_pos_system_access_token';
    // validateDiscount(posToken, {
    //   userQrCode: 'QRCODE123ABCDEF',
    //   partnerId: 'partner_pizza_hut_sofia',
    //   discountId: 'discount_pizza_hut_15'
    // }, 'en')
    // .then(result => {
    //   if (result.isValid) {
    //     console.log('User is eligible:', result.message);
    //   } else {
    //     console.log('User not eligible:', result.message);
    //   }
    // })
    // .catch(err => console.error(err.message));
    ```

*   **Success Response (Status: 200 OK - Valid)**:
    ```json
    {
      "isValid": true,
      "message": "User has an active subscription and is eligible for this discount.",
      "userDetails": {
        "id": "user_123abc",
        "fullName": "John Doe",
        "language": "en"
      },
      "applicableDiscount": {
        "id": "discount_pizza_hut_15",
        "name": "15% off all pizzas",
        "percentage": 15,
        "type": "percentage",
        "conditions": "Excludes promotional items."
      }
    }
    ```

*   **Success Response (Status: 200 OK - Invalid, but detailed)**:
    ```json
    {
      "isValid": false,
      "message": "User subscription is inactive or expired.",
      "errorCode": "SUBSCRIPTION_INACTIVE"
    }
    ```
    ```json
    {
      "isValid": false,
      "message": "Discount 'discount_pizza_hut_15' is not active for this partner or user.",
      "errorCode": "DISCOUNT_NOT_APPLICABLE"
    }
    ```

*   **Error Response (Example: 403 Forbidden - POS/Admin token lacks permission)**:
    ```json
    {
      "statusCode": 403,
      "message": "Forbidden: You do not have permission to validate transactions.",
      "errorCode": "PERMISSION_DENIED"
    }
    ```

---

### 4.2 Apply Discount & Log Transaction (for POS/Admin)

Logs a successful discount application and associated transaction details.

*   **Endpoint**: `POST /transactions/apply`
*   **Description**: After a successful `validate` call and the discount has been applied at the POS, this endpoint is used to log the transaction for analytics and partner billing.
*   **Required Header**: `Authorization: Bearer <POS_OR_ADMIN_ACCESS_TOKEN>`
*   **Request Body**:
    ```json
    {
      "userQrCode": "user_qr_code_from_mobile_app",
      "partnerId": "partner_pizza_hut_sofia",
      "discountId": "discount_pizza_hut_15",
      "totalBillAmount": 50.00,
      "discountAppliedAmount": 7.50,
      "currency": "BGN",
      "transactionDetails": {
        "items": [
          {"name": "Large Pizza", "quantity": 1, "price": 30.00},
          {"name": "Soft Drink", "quantity": 2, "price": 10.00}
        ]
      }
    }
    ```

*   **cURL Example**:
    ```bash
    curl -X POST \
      https://api.boomcard.com/v1/transactions/apply \
      -H 'Authorization: Bearer <POS_OR_ADMIN_ACCESS_TOKEN>' \
      -H 'Content-Type: application/json' \
      -d '{
        "userQrCode": "QRCODE123ABCDEF",
        "partnerId": "partner_pizza_hut_sofia",
        "discountId": "discount_pizza_hut_15",
        "totalBillAmount": 50.00,
        "discountAppliedAmount": 7.50,
        "currency": "BGN"
      }'
    ```

*   **JavaScript (Fetch API) Example**:
    ```javascript
    /**
     * @typedef {object} TransactionDetailsItem
     * @property {string} name
     * @property {number} quantity
     * @property {number} price
     */

    /**
     * @typedef {object} ApplyDiscountPayload
     * @property {string} userQrCode The QR code scanned from the user's app.
     * @property {string} partnerId The ID of the partner.
     * @property {string} discountId The ID of the discount applied.
     * @property {number} totalBillAmount The total bill amount before discount.
     * @property {number} discountAppliedAmount The monetary value of the discount applied.
     * @property {string} currency The currency of the transaction (e.g., "BGN", "EUR").
     * @property {object} [transactionDetails] Optional: detailed breakdown of the transaction.
     * @property {TransactionDetailsItem[]} [transactionDetails.items]
     */

    /**
     * @typedef {object} TransactionLogResponse
     * @property {string} message
     * @property {string} transactionId
     * @property {string} userId
     * @property {string} partnerId
     * @property {string} discountId
     * @property {number} totalBillAmount
     * @property {number} discountAppliedAmount
     */

    /**
     * Logs a successful discount transaction.
     * This is typically called by a POS system after a successful validation and discount application.
     * @param {string} posOrAdminAccessToken The access token of the POS system or an admin.
     * @param {ApplyDiscountPayload} transactionData
     * @returns {Promise<TransactionLogResponse>} Confirmation of the logged transaction.
     */
    async function applyDiscountAndLogTransaction(posOrAdminAccessToken, transactionData) {
      try {
        const response = await fetch('https://api.boomcard.com/v1/transactions/apply', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${posOrAdminAccessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(transactionData)
        });

        const data = await response.json();

        if (!response.ok) {
          console.error(`Transaction logging failed: ${response.status} - ${data.message || 'Unknown error'}`);
          throw new Error(data.message || 'Failed to log transaction');
        }

        console.log('Transaction logged successfully:', data);
        return data;
      } catch (error) {
        console.error('Network or unexpected error logging transaction:', error);
        throw error;
      }
    }

    // Example Usage:
    // const posToken = 'your_pos_system_access_token';
    // applyDiscountAndLogTransaction(posToken, {
    //   userQrCode: 'QRCODE123ABCDEF',
    //   partnerId: 'partner_pizza_hut_sofia',
    //   discountId: 'discount_pizza_hut_15',
    //   totalBillAmount: 50.00,
    //   discountAppliedAmount: 7.50,
    //   currency: 'BGN'
    // })
    // .then(result => console.log('Transaction confirmed:', result.transactionId))
    // .catch(err => console.error(err.message));
    ```

*   **Success Response (Status: 201 Created)**:
    ```json
    {
      "message": "Transaction logged successfully.",
      "transactionId": "txn_abc123def456",
      "userId": "user_123abc",
      "partnerId": "partner_pizza_hut_sofia",
      "discountId": "discount_pizza_hut_15",
      "totalBillAmount": 50.00,
      "discountAppliedAmount": 7.50,
      "currency": "BGN",
      "timestamp": "2023-11-02T14:30:00Z"
    }
    ```

*   **Error Response (Example: 400 Bad Request - Missing required fields)**:
    ```json
    {
      "statusCode": 400,
      "message": "Validation failed: 'totalBillAmount' is required.",
      "details": [
        { "field": "totalBillAmount", "message": "'totalBillAmount' is required" }
      ],
      "errorCode": "VALIDATION_ERROR"
    }
    ```
    ```json
    {
      "statusCode": 400,
      "message": "User QR code is invalid or expired.",
      "errorCode": "INVALID_QR_CODE"
    }
    ```
    ```json
    {
      "statusCode": 404,
      "message": "Partner with ID 'non_existent_partner' not found.",
      "errorCode": "PARTNER_NOT_FOUND"
    }
    ```

---

## 5. General Concepts

### 5.1 Internationalization (i18n)

The BOOM Card API supports multiple languages for localized content such as partner names, descriptions, and error messages.

*   **Mechanism**: Use the `Accept-Language` HTTP header in your requests.
*   **Supported Languages**:
    *   `en` (English - default if header is not provided or unknown language is specified)
    *   `bg` (Bulgarian)
*   **Example Usage**:
    ```
    Accept-Language: bg
    ```
    When this header is present, the API will attempt to return localized strings for relevant fields (e.g., `partner.name`, `category.description`, `error.message`). If a localized string is not available for the requested language, the default (`en`) or a fallback will be provided.

    **Example for partner search in Bulgarian:**
    ```bash
    curl -X GET \
      "https://api.boomcard.com/v1/partners?q=кафе" \
      -H 'Accept-Language: bg'
    ```
    Expected response will have `name` and `description` fields in Bulgarian:
    ```json
    {
      "partners": [
        {
          "id": "partner_art_cafe",
          "name": "Арт Кафе",
          "description": "Уютно кафене с уникална атмосфера.",
          "categories": ["cafes"],
          ...
        }
      ],
      ...
    }
    ```

### 5.2 Error Handling

The API follows a consistent error response structure to help client applications handle issues gracefully.

*   **Common Error Structure**:
    ```json
    {
      "statusCode": <HTTP_STATUS_CODE>,
      "message": "<A human-readable message describing the error>",
      "errorCode": "<A unique application-specific error code>",
      "details": [ // Optional: for validation errors or specific issues
        { "field": "<field_name>", "message": "<specific_validation_error>" }
      ]
    }
    ```

*   **Common Status Codes & Error Codes**:
    *   `400 Bad Request`: `VALIDATION_ERROR`, `INVALID_INPUT`, `BAD_REQUEST`
        *   Occurs when request payload/query parameters are malformed or invalid.
    *   `401 Unauthorized`: `AUTH_REQUIRED`, `INVALID_CREDENTIALS`, `INVALID_TOKEN`
        *   Occurs when authentication fails (missing token, invalid token, incorrect credentials).
    *   `403 Forbidden`: `PERMISSION_DENIED`
        *   Occurs when the authenticated user does not have the necessary permissions for the requested action.
    *   `404 Not Found`: `RESOURCE_NOT_FOUND`, `USER_NOT_FOUND`, `PARTNER_NOT_FOUND`, `SUBSCRIPTION_NOT_FOUND`
        *   Occurs when the requested resource does not exist.
    *   `409 Conflict`: `USER_ALREADY_EXISTS`, `RESOURCE_CONFLICT`
        *   Occurs when a request conflicts with the current state of the server (e.g., trying to register an existing email).
    *   `500 Internal Server Error`: `SERVER_ERROR`
        *   A generic error for unexpected server-side issues.

*   **Example of Client-Side Error Handling (JavaScript)**:
    ```javascript
    async function makeApiRequest(url, options) {
      try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (!response.ok) {
          // Check if 'data' contains our standard error structure
          if (data && typeof data.statusCode === 'number' && typeof data.message === 'string') {
            const error = new Error(data.message);
            error.statusCode = data.statusCode;
            error.errorCode = data.errorCode;
            error.details = data.details; // For validation errors
            throw error;
          } else {
            // Fallback for non-standard error responses
            throw new Error(`API request failed with status ${response.status}: ${JSON.stringify(data)}`);
          }
        }
        return data;
      } catch (error) {
        console.error('Caught error during API call:', error.message, error.statusCode, error.errorCode, error.details);
        // Re-throw or handle specific error codes
        if (error.statusCode === 401) {
          console.log('User needs to re-authenticate or refresh token.');
          // Redirect to login or initiate token refresh flow
        }
        throw error; // Propagate the error for further handling
      }
    }

    // Usage:
    // makeApiRequest('https://api.boomcard.com/v1/users/me', {
    //   headers: { 'Authorization': 'Bearer invalid_token' }
    // })
    // .then(profile => console.log(profile))
    // .catch(err => {
    //   if (err.errorCode === 'AUTH_REQUIRED') {
    //     alert('Session expired. Please log in again.');
    //   } else {
    //     alert(`An error occurred: ${err.message}`);
    //   }
    // });
    ```

### 5.3 Security Best Practices

When integrating with the BOOM Card API, consider the following security best practices:

*   **Always use HTTPS**: All API communication must happen over HTTPS to prevent eavesdropping and Man-in-the-Middle attacks. The base URL provided (`https://api.boomcard.com/v1`) assumes this.
*   **Protect Access Tokens**:
    *   Access tokens are short-lived JWTs. Store them in memory or in HttpOnly cookies (preferred for browser-based apps to prevent XSS). If storing in `localStorage`, be aware of XSS risks.
    *   Never expose access tokens in client-side code directly or commit them to source control.
*   **Secure Refresh Tokens**:
    *   Refresh tokens are long-lived and should be treated with extreme care. They should always be stored in HttpOnly, Secure cookies (`SameSite=Lax` or `Strict` as appropriate) to mitigate XSS and CSRF attacks.
    *   They should only be sent to the `/auth/refresh-token` endpoint.
*   **Token Expiry and Refresh Logic**: Implement robust logic to handle access token expiry. When an access token expires (or a `401 Unauthorized` error is received due to an expired token), use the refresh token to obtain a new access token without requiring the user to re-authenticate. If refresh fails, prompt re-login.
*   **Input Validation**: Always validate and sanitize all user inputs on both the client and server side to prevent injection attacks (e.g., SQL injection, XSS) and ensure data integrity. The API will perform server-side validation, but client-side validation provides a better user experience.
*   **CORS (Cross-Origin Resource Sharing)**: The API will be configured with appropriate CORS headers to allow legitimate client applications (e.g., your React/Next.js frontend) to access it. Ensure your client's origin is whitelisted in the backend's CORS configuration.
*   **Rate Limiting**: The API may implement rate limiting to protect against abuse and ensure fair usage. Implement retry mechanisms with exponential backoff on the client side for `429 Too Many Requests` responses.
*   **Sensitive Data Handling**: Never send sensitive user information (like raw passwords) in query parameters or expose them in client-side logs. Use HTTPS and POST requests for such data.