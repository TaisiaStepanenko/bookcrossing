import {sequelize} from '../config/database';
import User from './User';
import Region from './Region';
import City from './City';
import Book from './Book';
import BookPhoto from './BookPhoto';
import Transfer from './Transfer';
import OfferingBook from './OfferingBook';
import Favorite from './Favorite';
import Review from './Review';
import Notification from './Notification';

Region.hasMany(City, { foreignKey: 'region_id' });
City.belongsTo(Region, { foreignKey: 'region_id' });

City.hasMany(User, { foreignKey: 'city_id', as: 'users' });
User.belongsTo(City, { foreignKey: 'city_id' , as: 'city'});

User.hasMany(Book, { foreignKey: 'owner_id', as: 'books' });
Book.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

Book.hasMany(BookPhoto, { foreignKey: 'book_id', as: 'photos' });
BookPhoto.belongsTo(Book, { foreignKey: 'book_id', as: 'book' });

User.hasMany(Transfer, {foreignKey: 'initiator_id', as: 'initiatedTransfers'});
Transfer.belongsTo(User, {foreignKey: 'initiator_id', as: 'initiator'});
User.hasMany(Transfer, {foreignKey: 'owner_id', as: 'receivedTransfers'});
Transfer.belongsTo(User, {foreignKey: 'owner_id', as: 'owner'});
Book.hasMany(Transfer, {foreignKey: 'book_id', as: 'transfers'});
Transfer.belongsTo(Book, {foreignKey: 'book_id', as: 'book'});

Transfer.hasMany(OfferingBook, {foreignKey: 'transfer_id', as: 'offeringBooks'});
OfferingBook.belongsTo(Transfer, {foreignKey: 'transfer_id', as: 'transfer'});
Book.hasMany(OfferingBook, {foreignKey: 'book_id', as: 'offerings'});
OfferingBook.belongsTo(Book, {foreignKey: 'book_id', as: 'book'});

Transfer.hasMany(Review, {foreignKey: 'transfer_id', as: 'reviews'});
Review.belongsTo(Transfer, {foreignKey: 'transfer_id', as: 'transfer'});
User.hasMany(Review, { foreignKey: 'reviewer_id', as: 'reviewsGiven' });
Review.belongsTo(User, { foreignKey: 'reviewer_id', as: 'reviewer'});
User.hasMany(Review, { foreignKey: 'reviewed_user_id', as: 'reviewsReceived' });
Review.belongsTo(User, { foreignKey: 'reviewed_user_id', as: 'reviewedUser'});



Book.hasMany(Favorite, { foreignKey: 'book_id', as: 'favorites' });
Favorite.belongsTo(Book, { foreignKey: 'book_id', as: 'book' });

User.hasMany(Favorite, { foreignKey: 'user_id', as: 'favorites' });
Favorite.belongsTo(User, { foreignKey: 'user_id', as: 'user' });


User.belongsToMany(Book, {
    through: Favorite,
    foreignKey: 'user_id',
    otherKey: 'book_id',
    as: 'favoriteBooks'
});

Book.belongsToMany(User, {
    through: Favorite,
    foreignKey: 'book_id',
    otherKey: 'user_id',
    as: 'favoritedByUsers'
});



Transfer.hasMany(Notification, {foreignKey: 'transfer_id', as: 'notifications'});
Notification.belongsTo(Transfer, {foreignKey: 'transfer_id', as: 'transfer'});
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'initiator' });
Notification.belongsTo(User, { foreignKey: 'target_user_id', as: 'targetUser' });


export { User, City, Notification, Region, Book, BookPhoto, Transfer, OfferingBook, Favorite, Review };
