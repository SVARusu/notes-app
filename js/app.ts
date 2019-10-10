console.log("something else");

import './db';
import './registerpage';
import './index';
import './notespage';
import './stitch/stitchIndex';
import { loginAnonymous, hasLoggedInUser, getCurrentUser } from './stitch/stitchIndex';

loginAnonymous().then( () => {
  console.log('Anonymous user logged in: ', hasLoggedInUser());
});
