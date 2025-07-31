const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER, // 분 단위
    allowNull: false,
    defaultValue: 30
  },
  location_type: {
    type: DataTypes.ENUM('online', 'phone', 'in_person'),
    allowNull: false,
    defaultValue: 'online'
  },
  location_details: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#1890ff'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  booking_link: {
    type: DataTypes.STRING,
    unique: true
  },
  buffer_time_before: {
    type: DataTypes.INTEGER, // 분 단위
    defaultValue: 0
  },
  buffer_time_after: {
    type: DataTypes.INTEGER, // 분 단위
    defaultValue: 0
  },
  max_bookings_per_day: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  advance_booking_limit: {
    type: DataTypes.INTEGER, // 일 단위
    defaultValue: 30
  },
  cancellation_policy: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'events',
  hooks: {
    beforeCreate: async (event) => {
      // 고유한 예약 링크 생성
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      event.booking_link = `moyak-${timestamp}-${randomString}`;
    }
  }
});

module.exports = Event; 