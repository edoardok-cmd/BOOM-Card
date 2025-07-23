# Syntax Fix Report

## Summary
- Fixed: 149 files
- Failed: 18 files
- Total files with errors: 167

## Files That Need Manual Review

### .eslintrc.json
- Expecting property name enclosed in double quotes: line 54 column 5 (char 1111)

### database/migrate.js
- Mismatched brackets: '[' at 419, '}' at 425

### frontend/src/utils/constants.ts
- Mismatched brackets: '(' at 11592, ']' at 11593

### frontend/src/components/layout/Header.tsx
- Unmatched opening bracket '('

### frontend/src/components/search/SearchResults.tsx
- Unmatched opening bracket '('

### frontend/src/components/partner/PartnerCard.tsx
- Unmatched opening bracket '('

### frontend/src/components/partner/PartnerMap.tsx
- Unmatched opening bracket '('

### frontend/src/components/partner/PartnerDetails.tsx
- Unmatched opening bracket '{'

### frontend/src/components/common/Select.tsx
- Unmatched opening bracket '{'

### frontend/src/components/__tests__/PaymentForm.test.tsx
- Unmatched opening bracket '{'

### frontend/src/components/__tests__/DealCard.test.tsx
- Unmatched opening bracket '('

### frontend/src/components/__tests__/Map.test.tsx
- Unmatched opening bracket '{'

### frontend/src/components/__tests__/Map.snapshot.test.tsx
- Unmatched opening bracket '{'

### frontend/src/components/__tests__/PartnerCard.test.tsx
- Unmatched opening bracket '{'

### frontend/src/components/__tests__/SearchBar.test.tsx
- Unmatched opening bracket '{'

### frontend/src/components/__tests__/PaymentForm.snapshot.test.tsx
- Unmatched opening bracket '('

### frontend/src/hooks/useApi.ts
- Unmatched opening bracket '('

### frontend/src/i18n/locales/en.json
- Expecting value: line 1 column 1 (char 0)

### frontend/src/i18n/locales/bg.json
- Expecting value: line 1 column 1 (char 0)

### frontend/src/i18n/locales/es.json
- Expecting value: line 1 column 1 (char 0)

### frontend/src/pages/index.tsx
- Unmatched opening bracket '('

### frontend/src/pages/search.tsx
- Unmatched opening bracket '{'

### frontend/src/pages/about.tsx
- Unmatched opening bracket '('

### frontend/src/pages/partners/index.tsx
- Unmatched opening bracket '('

### frontend/src/pages/partners/[id].tsx
- Unmatched opening bracket '{'

### frontend/src/services/auth.service.ts
- Unmatched closing bracket '}'

### frontend/src/services/api.ts
- Unmatched opening bracket '{'

### frontend/src/services/user.service.ts
- Unmatched opening bracket '{'

### frontend/src/services/partner.service.ts
- Unmatched opening bracket '('

### api-gateway/src/routes.ts
- Unmatched opening bracket '('

### api-gateway/src/index.ts
- Unmatched opening bracket '{'

### api-gateway/src/middleware/auth.ts
- Unmatched opening bracket '{'

### backend/src/index.ts
- Unmatched opening bracket '('

### backend/src/middleware/index.ts
- Unmatched opening bracket '{'

### backend/src/database/migrations/015_migration.ts
- Unmatched opening bracket '['

### backend/src/database/migrations/012_migration.ts
- Unmatched opening bracket '('

### backend/src/database/migrations/013_migration.ts
- Unmatched opening bracket '('

### backend/src/database/migrations/014_migration.ts
- Unmatched opening bracket '{'

### backend/src/database/migrations/019_migration.ts
- Unmatched opening bracket '{'

### backend/src/database/migrations/018_migration.ts
- Unmatched opening bracket '{'

### backend/src/database/migrations/020_migration.ts
- Unmatched opening bracket '('

### backend/src/database/migrations/016_migration.ts
- Unmatched opening bracket '('

### backend/src/database/migrations/011_migration.ts
- Unmatched opening bracket '{'

### backend/src/database/migrations/010_migration.ts
- Unmatched opening bracket '['

### backend/src/database/seeds/categories.seed.ts
- Unmatched opening bracket '{'

### backend/src/database/seeds/partners.seed.ts
- Unmatched opening bracket '{'

### backend/src/database/seeds/deals.seed.ts
- Unmatched opening bracket '{'

### backend/src/database/seeds/subscriptions.seed.ts
- Unmatched opening bracket '{'

### backend/src/database/seeds/users.seed.ts
- Unmatched opening bracket '{'

### backend/src/types/index.d.ts
- Unmatched opening bracket '{'

### backend/src/config/redis.ts
- Unmatched opening bracket '{'

### backend/src/config/index.ts
- Unmatched opening bracket '{'

### backend/src/tests/unit/services/user.test.ts
- Unmatched opening bracket '{'

### backend/src/tests/unit/services/auth.test.ts
- Unmatched opening bracket '{'

### backend/src/tests/integration/auth.test.ts
- Unmatched opening bracket '('

### backend/src/tests/e2e/user-flow.test.ts
- Unmatched opening bracket '('

### backend/src/utils/tokenGenerator.ts
- Unmatched opening bracket '{'

### backend/src/docs/swagger.json
- Expecting value: line 1 column 1 (char 0)

### backend/src/__tests__/integration/auth.integration.test.ts
- Unmatched opening bracket '{'

### backend/src/__tests__/integration/qr-redemption.integration.test.ts
- Unmatched opening bracket '{'

### backend/src/__tests__/integration/payment.integration.test.ts
- Unmatched opening bracket '{'

### backend/src/jobs/emailJob.ts
- Unmatched opening bracket '{'

### backend/src/jobs/notificationJob.ts
- Unmatched opening bracket '{'

### backend/src/jobs/analyticsJob.ts
- Unmatched opening bracket '{'

### backend/src/controllers/__tests__/qrcode.controller.test.ts
- Unmatched opening bracket '{'

### backend/src/routes/admin.routes.ts
- Unmatched opening bracket '['

### backend/src/routes/partner.routes.ts
- Unmatched opening bracket '['

### backend/src/routes/auth.routes.ts
- Unmatched opening bracket '{'

### backend/src/services/push-notification.service.ts
- Unmatched opening bracket '{'

### backend/src/services/email-sender.service.ts
- Unmatched opening bracket '{'

### backend/src/services/recommendation-engine.service.ts
- Unmatched opening bracket '{'

### backend/src/services/export-handler.service.ts
- Unmatched opening bracket '{'

### backend/src/services/restore-service.service.ts
- Unmatched opening bracket '{'

### backend/src/services/fraud-detector.service.ts
- Unmatched opening bracket '{'

### backend/src/services/search.service.ts
- Unmatched opening bracket '{'

### backend/src/services/recommendation.service.ts
- Unmatched opening bracket '{'

### backend/src/services/report-generator.service.ts
- Unmatched opening bracket '('

### backend/src/services/search-indexer.service.ts
- Unmatched closing bracket '}'

### backend/src/services/audit-logger.service.ts
- Unmatched closing bracket '}'

### backend/src/services/sms-sender.service.ts
- Unmatched opening bracket '('

### backend/src/services/discount-calculator.service.ts
- Unmatched opening bracket '{'

### backend/src/services/qr-generator.service.ts
- Unmatched opening bracket '{'

### backend/src/services/cache-manager.service.ts
- Unmatched opening bracket '{'

### backend/src/services/cache.service.ts
- Mismatched brackets: '(' at 19834, '}' at 24354

### backend/src/services/import-handler.service.ts
- Unmatched opening bracket '{'

### backend/src/services/__tests__/discount-calculator.service.test.ts
- Unmatched opening bracket '{'

### backend/src/services/__tests__/search-indexer.service.test.ts
- Unmatched opening bracket '('

### backend/src/services/__tests__/export-handler.service.test.ts
- Unmatched opening bracket '{'

### backend/src/services/__tests__/qrcode.service.test.ts
- Unmatched opening bracket '{'

### backend/src/services/__tests__/push-notification.service.test.ts
- Unmatched opening bracket '('

### backend/src/services/__tests__/import-handler.service.test.ts
- Unmatched opening bracket '('

### backend/src/services/__tests__/fraud-detector.service.test.ts
- Unmatched opening bracket '{'

### backend/src/services/__tests__/qr-generator.service.test.ts
- Unmatched opening bracket '{'

### backend/src/services/__tests__/cache-manager.service.test.ts
- Unmatched opening bracket '{'

### backend/src/services/__tests__/backup-service.service.test.ts
- Unmatched opening bracket '('

### backend/src/services/__tests__/rate-limiter.service.test.ts
- Unmatched opening bracket '{'

### backend/src/services/__tests__/email-sender.service.test.ts
- Unmatched opening bracket '('

### backend/src/services/__tests__/report-generator.service.test.ts
- Unmatched opening bracket '{'

### backend/src/services/__tests__/recommendation-engine.service.test.ts
- Unmatched opening bracket '('

### search/elasticsearch/settings.json
- Expecting value: line 419 column 20 (char 10000)

### search/elasticsearch/mappings.json
- Unterminated string starting at: line 447 column 7 (char 9988)

### data-pipeline/kafka/topics.json
- Expecting property name enclosed in double quotes: line 254 column 2 (char 10000)

### packages/ui-components/src/Tabs/Tabs.tsx
- Unmatched opening bracket '{'

### packages/ui-components/src/Tabs/Tabs.stories.tsx
- Unmatched opening bracket '('

### packages/ui-components/src/Tabs/__tests__/Tabs.test.tsx
- Unmatched opening bracket '{'

### packages/ui-components/src/Dropdown/Dropdown.tsx
- Unmatched opening bracket '('

### packages/ui-components/src/Dropdown/Dropdown.stories.tsx
- Unmatched opening bracket '{'

### packages/ui-components/src/Dropdown/__tests__/Dropdown.test.tsx
- Unmatched opening bracket '('

### packages/ui-components/src/Drawer/Drawer.stories.tsx
- Unmatched opening bracket '('

### packages/ui-components/src/Drawer/Drawer.tsx
- Unmatched opening bracket '('

### packages/ui-components/src/Pagination/Pagination.tsx
- Unmatched opening bracket '('

### packages/ui-components/src/Pagination/__tests__/Pagination.test.tsx
- Unmatched opening bracket '{'

### packages/ui-components/src/TimePicker/TimePicker.tsx
- Unmatched opening bracket '('

### packages/ui-components/src/TimePicker/TimePicker.stories.tsx
- Unmatched opening bracket '['

### packages/ui-components/src/TimePicker/__tests__/TimePicker.test.tsx
- Unmatched opening bracket '{'

### packages/ui-components/src/Form/Form.stories.tsx
- Unmatched opening bracket '('

### packages/ui-components/src/Form/Form.tsx
- Unmatched opening bracket '{'

### packages/ui-components/src/Form/__tests__/Form.test.tsx
- Unmatched opening bracket '('

### packages/ui-components/src/Tooltip/__tests__/Tooltip.test.tsx
- Unmatched opening bracket '{'

### packages/ui-components/src/Radio/Radio.stories.tsx
- Unmatched opening bracket '('

### packages/ui-components/src/Radio/__tests__/Radio.test.tsx
- Unmatched opening bracket '('

### packages/ui-components/src/Card/Card.stories.tsx
- Unmatched opening bracket '('

### packages/ui-components/src/Card/__tests__/Card.test.tsx
- Unmatched opening bracket '{'

### packages/ui-components/src/Progress/__tests__/Progress.test.tsx
- Unmatched opening bracket '{'

### packages/ui-components/src/Input/__tests__/Input.test.tsx
- Unmatched opening bracket '('

### packages/ui-components/src/Alert/__tests__/Alert.test.tsx
- Unmatched opening bracket '{'

### packages/ui-components/src/Accordion/Accordion.stories.tsx
- Unmatched opening bracket '('

### packages/ui-components/src/Accordion/__tests__/Accordion.test.tsx
- Unmatched opening bracket '('

### packages/ui-components/src/DatePicker/DatePicker.tsx
- Unmatched opening bracket '{'

### packages/ui-components/src/DatePicker/DatePicker.styles.ts
- Unmatched opening bracket '{'

### packages/ui-components/src/DatePicker/__tests__/DatePicker.test.tsx
- Unmatched opening bracket '('

### packages/ui-components/src/Toast/__tests__/Toast.test.tsx
- Unmatched opening bracket '{'

### packages/ui-components/src/Checkbox/Checkbox.stories.tsx
- Unmatched opening bracket '('

### packages/ui-components/src/Checkbox/__tests__/Checkbox.test.tsx
- Unmatched opening bracket '{'

### packages/ui-components/src/Slider/__tests__/Slider.test.tsx
- Unmatched opening bracket '{'

### packages/ui-components/src/Popover/Popover.tsx
- Unmatched opening bracket '('

### packages/ui-components/src/Popover/Popover.stories.tsx
- Unmatched opening bracket '('

### packages/ui-components/src/Popover/__tests__/Popover.test.tsx
- Unmatched opening bracket '('

### packages/ui-components/src/Button/Button.stories.tsx
- Unmatched opening bracket '('

### packages/ui-components/src/Button/__tests__/Button.test.tsx
- Unmatched opening bracket '{'

### packages/ui-components/src/Table/Table.tsx
- Unmatched opening bracket '('

### packages/ui-components/src/Table/Table.stories.tsx
- Unmatched opening bracket '{'

### packages/ui-components/src/Table/__tests__/Table.test.tsx
- Unmatched opening bracket '{'

### packages/ui-components/src/Menu/Menu.tsx
- Unmatched opening bracket '('

### packages/ui-components/src/Menu/__tests__/Menu.test.tsx
- Unmatched opening bracket '('

### packages/ui-components/src/Avatar/Avatar.stories.tsx
- Unmatched opening bracket '('

### packages/ui-components/src/Switch/Switch.tsx
- Unmatched opening bracket '('

### packages/ui-components/src/Switch/__tests__/Switch.test.tsx
- Unmatched opening bracket '('

### packages/ui-components/src/Select/Select.stories.tsx
- Unmatched opening bracket '('

### packages/ui-components/src/Select/Select.tsx
- Unmatched opening bracket '('

### packages/ui-components/src/Select/__tests__/Select.test.tsx
- Unmatched opening bracket '('

### packages/ui-components/src/Modal/Modal.stories.tsx
- Unmatched opening bracket '('

### packages/ui-components/src/Modal/__tests__/Modal.test.tsx
- Unmatched opening bracket '{'

### queue/src/consumers/index.ts
- Unmatched opening bracket '('

### queue/src/events/user.events.ts
- Unmatched opening bracket '{'

### queue/src/events/transaction.events.ts
- Unmatched opening bracket '{'

### bi/dashboards/executive-summary.json
- Expecting ',' delimiter: line 323 column 1 (char 8000)

### performance/lighthouse.config.js
- Unmatched opening bracket '{'

### service-mesh/consul/config.json
- Unterminated string starting at: line 389 column 5 (char 9996)

### e2e/cypress/integration/admin-journey.spec.ts
- Unmatched opening bracket '{'

### e2e/cypress/integration/mobile-journey.spec.ts
- Unmatched opening bracket '{'

### e2e/cypress/integration/consumer-journey.spec.ts
- Unmatched opening bracket '{'

### e2e/cypress/integration/partner-journey.spec.ts
- Unmatched opening bracket '{'

### e2e/cypress/support/commands.ts
- Unmatched opening bracket '{'

### services/notification-service/src/index.ts
- Unmatched opening bracket '{'

### services/analytics-service/src/index.ts
- Unmatched opening bracket '('

### services/auth-service/src/index.ts
- Unmatched opening bracket '{'

