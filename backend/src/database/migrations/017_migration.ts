import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

interface MigrationMetadata {
  version: string;
  name: string;
  timestamp: number;
  description: string;
}

interface ColumnDefinition {
  name: string;
  type: string;
  isPrimary?: boolean;
  isNullable?: boolean;
  isUnique?: boolean;
  default?: any;
  comment?: string;
}

interface IndexDefinition {
  name: string;
  columnNames: string[];
  isUnique?: boolean;
  where?: string;
}

interface ForeignKeyDefinition {
  name: string;
  columnNames: string[];
  referencedTableName: string;
  referencedColumnNames: string[];
  onDelete?: string;
  onUpdate?: string;
}

const MIGRATION_METADATA: MigrationMetadata = {
  version: '017',
  name: 'AddCardAnalyticsAndRewardsSystem',
  timestamp: 1736883600000,
  description: 'Add card analytics tracking, rewards system, and performance optimizations'
};

const SCHEMA_NAME = 'public';
const CASCADE_OPTIONS = { onDelete: 'CASCADE', onUpdate: 'CASCADE' };
const RESTRICT_OPTIONS = { onDelete: 'RESTRICT', onUpdate: 'CASCADE' };
const SET_NULL_OPTIONS = { onDelete: 'SET NULL', onUpdate: 'CASCADE' };

const TIMESTAMP_COLUMNS: ColumnDefinition[] = [
  {
    name: 'created_at',
    type: 'timestamp with time zone',
    default: 'CURRENT_TIMESTAMP',
    isNullable: false
  },
  {
    name: 'updated_at',
    type: 'timestamp with time zone',
    default: 'CURRENT_TIMESTAMP',
    isNullable: false
  }
];

const UUID_PRIMARY_KEY: ColumnDefinition = {
  name: 'id',
  type: 'uuid',
  isPrimary: true,
  default: 'uuid_generate_v4()',
  isNullable: false
};

export class Migration017AddDynamicPricingHistory implements Migration {
  async up(queryInterface: QueryInterface): Promise<void> {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Create dynamic_pricing_history table
      await queryInterface.createTable('dynamic_pricing_history', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        boom_card_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'boom_cards',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        timestamp: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        },
        base_price: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false
        },
        adjusted_price: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false
        },
        price_factors: {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: {},
        market_conditions: {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: {},
        algorithm_version: {
          type: DataTypes.STRING(50),
          allowNull: false,
          defaultValue: 'v1.0'
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        }, { transaction });

      // Create indexes for performance
      await queryInterface.addIndex('dynamic_pricing_history', ['boom_card_id'], {
        name: 'idx_dynamic_pricing_history_boom_card_id',
        transaction
      });

      await queryInterface.addIndex('dynamic_pricing_history', ['timestamp'], {
        name: 'idx_dynamic_pricing_history_timestamp',
        transaction
      });

      await queryInterface.addIndex('dynamic_pricing_history', ['boom_card_id', 'timestamp'], {
        name: 'idx_dynamic_pricing_history_composite',
        transaction
      });

      // Add dynamic pricing columns to boom_cards table
      await queryInterface.addColumn('boom_cards', 'dynamic_pricing_enabled', {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      }, { transaction });

      await queryInterface.addColumn('boom_cards', 'base_price', {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('boom_cards', 'current_price', {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('boom_cards', 'price_update_frequency', {
        type: DataTypes.ENUM('HOURLY', 'DAILY', 'WEEKLY', 'REAL_TIME'),
        defaultValue: 'DAILY',
        allowNull: false
      }, { transaction });

      await queryInterface.addColumn('boom_cards', 'min_price', {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('boom_cards', 'max_price', {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('boom_cards', 'price_factors_config', {
        type: DataTypes.JSONB,
        defaultValue: {
          demand_weight: 0.3,
          supply_weight: 0.3,
          time_weight: 0.2,
          competition_weight: 0.2
        },
        allowNull: false
      }, { transaction });

      await queryInterface.addColumn('boom_cards', 'last_price_update', {
        type: DataTypes.DATE,
        allowNull: true
      }, { transaction });

      // Create trigger for automatic timestamp updates
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION update_dynamic_pricing_history_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ language 'plpgsql';
      `, { transaction });

      await queryInterface.sequelize.query(`
        CREATE TRIGGER update_dynamic_pricing_history_updated_at
        BEFORE UPDATE ON dynamic_pricing_history
        FOR EACH ROW
        EXECUTE FUNCTION update_dynamic_pricing_history_updated_at();
      `, { transaction });

      // Create stored procedure for price calculation
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION calculate_dynamic_price(
          p_boom_card_id INTEGER,
          p_demand_factor DECIMAL,
          p_supply_factor DECIMAL,
          p_time_factor DECIMAL,
          p_competition_factor DECIMAL
        )
        RETURNS DECIMAL AS $$
        DECLARE
          v_base_price DECIMAL;
          v_min_price DECIMAL;
          v_max_price DECIMAL;
          v_price_factors_config JSONB;
          v_adjusted_price DECIMAL;
        BEGIN
          SELECT base_price, min_price, max_price, price_factors_config
          INTO v_base_price, v_min_price, v_max_price, v_price_factors_config
          FROM boom_cards
          WHERE id = p_boom_card_id;

          IF v_base_price IS NULL THEN
            RAISE EXCEPTION 'Base price not set for boom card %', p_boom_card_id;
          END IF;

          v_adjusted_price := v_base_price * (
            1 + 
            (p_demand_factor * (v_price_factors_config->>'demand_weight')::DECIMAL) +
            (p_supply_factor * (v_price_factors_config->>'supply_weight')::DECIMAL) +
            (p_time_factor * (v_price_factors_config->>'time_weight')::DECIMAL) +
            (p_competition_factor * (v_price_factors_config->>'competition_weight')::DECIMAL)
          );

          -- Apply price bounds
          IF v_min_price IS NOT NULL AND v_adjusted_price < v_min_price THEN
            v_adjusted_price := v_min_price;
          END IF;

          IF v_max_price IS NOT NULL AND v_adjusted_price > v_max_price THEN
            v_adjusted_price := v_max_price;
          END IF;

          RETURN ROUND(v_adjusted_price, 2);
        END;
        $$ LANGUAGE plpgsql;
      `, { transaction });

      // Create view for latest prices
      await queryInterface.sequelize.query(`
        CREATE VIEW boom_card_latest_prices AS
        SELECT DISTINCT ON (boom_card_id)
          boom_card_id,
          timestamp,
          base_price,
          adjusted_price,
          price_factors,
          market_conditions,
          algorithm_version
        FROM dynamic_pricing_history
        ORDER BY boom_card_id, timestamp DESC;
      `, { transaction });

      // Create materialized view for price analytics
      await queryInterface.sequelize.query(`
        CREATE MATERIALIZED VIEW boom_card_price_analytics AS
        SELECT 
          bc.id as boom_card_id,
          bc.title,
          bc.dynamic_pricing_enabled,
          COUNT(dph.id) as price_change_count,
          AVG(dph.adjusted_price) as avg_price,
          MIN(dph.adjusted_price) as min_historical_price,
          MAX(dph.adjusted_price) as max_historical_price,
          STDDEV(dph.adjusted_price) as price_volatility,
          MAX(dph.timestamp) as last_update
        FROM boom_cards bc
        LEFT JOIN dynamic_pricing_history dph ON bc.id = dph.boom_card_id
        GROUP BY bc.id, bc.title, bc.dynamic_pricing_enabled;
      `, { transaction });

      await queryInterface.addIndex('boom_card_price_analytics', ['boom_card_id'], {
        name: 'idx_boom_card_price_analytics_id',
        transaction
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  async down(queryInterface: QueryInterface): Promise<void> {

    try {
      // Drop views
      await queryInterface.sequelize.query('DROP MATERIALIZED VIEW IF EXISTS boom_card_price_analytics;', { transaction });
      await queryInterface.sequelize.query('DROP VIEW IF EXISTS boom_card_latest_prices;', { transaction });

      // Drop stored procedures
      await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS calculate_dynamic_price;', { transaction });

      // Drop triggers
      await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS update_dynamic_pricing_history_updated_at ON dynamic_pricing_history;', { transaction });
      await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS update_dynamic_pricing_history_updated_at;', { transaction });

      // Remove columns from boom_cards
      await queryInterface.removeColumn('boom_cards', 'last_price_update', { transaction });
      await queryInterface.removeColumn('boom_cards', 'price_factors_config', { transaction });
      await queryInterface.removeColumn('boom_cards', 'max_price', { transaction });
      await queryInterface.removeColumn('boom_cards', 'min_price', { transaction });
      await queryInterface.removeColumn('boom_cards', 'price_update_frequency', { transaction });
      await queryInterface.removeColumn('boom_cards', 'current_price', { transaction });
      await queryInterface.removeColumn('boom_cards', 'base_price', { transaction });
      await queryInterface.removeColumn('boom_cards', 'dynamic_pricing_enabled', { transaction });

      // Drop dynamic_pricing_history table
      await queryInterface.dropTable('dynamic_pricing_history', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
}

export default new Migration017AddDynamicPricingHistory();

}
}
}
}
}
