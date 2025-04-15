import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

const SearchService = {
  async search(query: string) {
    const advertsSnapshot = await getDocs(collection(db, "adverts"));
    const usersSnapshot = await getDocs(collection(db, "users"));

    const adverts = advertsSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((advert) => advert.title.toLowerCase().includes(query.toLowerCase()));

    const users = usersSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((user) => user.username.toLowerCase().includes(query.toLowerCase()));

    return [...adverts, ...users];
  },
};

export default SearchService;
