// Auth0 check + loading (or creating) the user record for every protected request.
import { auth } from 'express-oauth2-jwt-bearer';
import { config } from '../config.js';
import { User } from '../models/User.js';
import { httpError } from '../utils/http.js';
import { todayStr } from '../utils/dates.js';

export function requireAuth() {
  if (config.authDisabled) {
    // Local testing: pretend the caller is whoever the x-dev-user header names.
    return [(req, _res, next) => {
      req.authSub = req.header('x-dev-user') || 'dev|local-user';
      next();
    }];
  }
  return [
    auth({ audience: config.auth0.audience, issuerBaseURL: `https://${config.auth0.domain}/` }),
    (req, _res, next) => {
      req.authSub = req.auth.payload.sub; // e.g. "google-oauth2|1234..."
      next();
    },
  ];
}

// Creates the user on first login, so the frontend never needs a separate "sign up" call.
export async function loadUser(req, _res, next) {
  let user = await User.findOne({ auth0Id: req.authSub });
  if (!user) {
    try {
      user = await User.create({ auth0Id: req.authSub, gameDate: todayStr() });
    } catch (err) {
      if (err.code !== 11000) throw err; // two first requests at once: the other one created it
      user = await User.findOne({ auth0Id: req.authSub });
    }
  }
  req.user = user;
  next();
}

export function requireOnboarded(req, _res, next) {
  if (!req.user.onboarded) return next(httpError(409, 'Finish onboarding first'));
  next();
}
