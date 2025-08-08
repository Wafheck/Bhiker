class AuthStore {
    constructor() {
        this.user     = null;
        this.vendorID = null;
    }
    setUser(userData) {
        this.user     = userData;
        this.vendorID = userData.vendorID || null;
    }
    getUser()     { return this.user; }
    getVendorID(){ return this.vendorID; }
    isLoggedIn()  { return !!this.user; }
    isVendor()    { return this.user?.role === 'vendor'; }
    clear() {
        this.user     = null;
        this.vendorID = null;
        localStorage.removeItem("user");
    }
}
const authStore = new AuthStore();
export default authStore;
