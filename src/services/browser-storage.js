const userIdKey         = 'userId'
const userEmailKey      = 'userEmail'
const userAccessTokenKey = 'userAccessToken'


export function localStoreUser(id, email) {
    localStorage.setItem(userIdKey,    id)
    localStorage.setItem(userEmailKey, email)
}

export function localStoreAccessToken(access_token) {
    localStorage.setItem(userAccessTokenKey, access_token)
}

export function localRetrieveUser() {
    return {
        id :    localStorage.getItem(userIdKey)    || '',
        email : localStorage.getItem(userEmailKey) || ''
    }
}

export function localRetrieveAccessToken() {
    return localStorage.getItem(userAccessTokenKey) || '';
}

export function localRemoveUser() {
    localStorage.removeItem(userIdKey)
    localStorage.removeItem(userEmailKey)
}

export function localRemoveAccessToken() {
    localStorage.removeItem(userAccessTokenKey)
}
