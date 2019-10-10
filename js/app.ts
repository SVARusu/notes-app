import './db';
import './index';
import './registerpage';
import './notespage';
import './stitch/stitchIndex';
import { loginAnonymous, hasLoggedInUser, getCurrentUser } from './stitch/stitchIndex';

loginAnonymous().then( () => {
  console.log('Anonymous user logged in: ', hasLoggedInUser());
});
