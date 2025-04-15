import passport from 'passport';
import { Strategy } from 'passport-local';
import { comparePassword } from './hashPassword';
import taskService from '../services/wiki-service';

// DETTE BRUKES FOR Å LAGE SESSION OG COOKIES TIL BRUKERE
// HAR KONSOLL LOGGET EN DEL SÅ HVIS DERE TESTER post:/LOGIN OG  get:/LOGIN/STATUS SÅ GÅR DET AN Å SE LITT HVA SOM SKJER

// KODE HENTET FRA YOUTUBE: https://www.youtube.com/watch?v=_lZUq39FGv0
// HAR OVERSATT TIL TS OG ENDRET PÅ SMÅTING SELV

passport.serializeUser((user: any, done) => {
  // console.log('inside serialize user');
  done(null, user.username);
});

passport.deserializeUser(async (username: string, done) => {
  // console.log('Inside deserialized user');
  // console.log('Deserializing User username: ' + username);
  try {
    const findUser = await taskService.getUser(username);
    if (!findUser) throw new Error('User Not Found');
    // converting array / buffer of picture into string (base64)
    let bufferString;
    if (findUser.profilePicture && findUser != null)
      bufferString = findUser.profilePicture.toString();
    findUser.profilePicture = bufferString;
    //
    done(null, findUser);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new Strategy(async (username: string, password: string, done: any) => {
    // console.log('username: ' + username);
    // console.log('password: ' + password);
    try {
      const findUser = await taskService.getUser(username);
      if (!findUser) throw new Error('User not found');
      if (!comparePassword(password, findUser.password)) throw new Error('Incorrect password');
      done(null, findUser);
    } catch (error) {
      done(error, null);
    }
  }),
);

export default passport;
