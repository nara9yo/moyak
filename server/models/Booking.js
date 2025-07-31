const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  event_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'events',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  guest_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  guest_email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  guest_phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  scheduled_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'declined'),
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  timezone: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Asia/Seoul'
  },
  calendar_event_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cancellation_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reminder_sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'bookings',
  indexes: [
    {
      fields: ['event_id', 'scheduled_at']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['guest_email']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Booking; 