module.exports = (req, res, next) => {
const admins = (process.env.ADMIN_USERNAMES || '').split(',').map((name) => name.trim());
if (!req.user || !admins.includes(req.user.username)) {
return res.status(403).json({ message: 'Accès réservé aux administrateurs.' });
}
next();
};
