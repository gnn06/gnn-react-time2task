const userIdKey         = 'userId'
const userEmailKey      = 'userEmail'
const userAccessTokenKey = 'userAccessToken'


export function storeUser(id, email) {
    sessionStorage.setItem(userIdKey,    id)
    sessionStorage.setItem(userEmailKey, email)
}

export function storeAccessToken(access_token) {
    sessionStorage.setItem(userAccessTokenKey, access_token)
}

export function retrieveUser() {
    return {
        id :    sessionStorage.getItem(userIdKey)    || '',
        email : sessionStorage.getItem(userEmailKey) || ''
    }
}

export function retrieveAccessToken() {
    return sessionStorage.getItem(userAccessTokenKey) || '';
}

export function removeUser() {
    sessionStorage.removeItem(userIdKey)
    sessionStorage.removeItem(userEmailKey)
}

export function removeAccessToken() {
    sessionStorage.removeItem(userAccessTokenKey)
}
