const User = require('./User');
const Event = require('./Event');
const Availability = require('./Availability');
const Booking = require('./Booking');

// 관계 설정
User.hasMany(Event, { foreignKey: 'user_id', as: 'events' });
Event.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Event.hasMany(Availability, { foreignKey: 'event_id', as: 'availabilities' });
Availability.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

Event.hasMany(Booking, { foreignKey: 'event_id', as: 'bookings' });
Booking.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

User.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  User,
  Event,
  Availability,
  Booking
}; 